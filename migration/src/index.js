import fs from 'fs/promises';
import xml2js from 'xml2js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import pLimit from 'p-limit';

dotenv.config();

// Configuration
const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    defaultAuthorId: process.env.DEFAULT_AUTHOR_ID,
    defaultBlogId: process.env.DEFAULT_BLOG_ID,
    defaultCategoryId: process.env.DEFAULT_CATEGORY_ID,
    batchSize: parseInt(process.env.BATCH_SIZE) || 100,
    concurrentRequests: parseInt(process.env.CONCURRENT_REQUESTS) || 5,
    dryRun: process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true',
    cleanShortcodes: process.env.CLEAN_SHORTCODES === 'true',
    autoCreateCategories: process.env.AUTO_CREATE_CATEGORIES === 'true',
    xmlFiles: process.env.XML_FILES?.split(',').map(f => f.trim()) || []
};

// Initialize Supabase
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Statistics
const stats = {
    total: 0,
    processed: 0,
    success: 0,
    errors: 0,
    skipped: 0,
    startTime: Date.now()
};

const errors = [];
const categoryMap = new Map(); // WordPress category → Supabase ID

// Utility Functions
function cleanShortcodes(content) {
    if (!config.cleanShortcodes) return content;

    // Remove WordPress shortcodes
    return content
        .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gi, '$1')
        .replace(/\[gallery[^\]]*\]/gi, '')
        .replace(/\[embed[^\]]*\](.*?)\[\/embed\]/gi, '$1')
        .replace(/\[\/?[^\]]+\]/g, '');
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

async function ensureUniqueSlug(baseSlug, existingSlugs) {
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    existingSlugs.add(slug);
    return slug;
}

// Category Management
async function getOrCreateCategory(categoryName) {
    if (!categoryName) return config.defaultCategoryId;

    // Check cache
    if (categoryMap.has(categoryName)) {
        return categoryMap.get(categoryName);
    }

    if (config.dryRun) {
        categoryMap.set(categoryName, 'dry-run-category-id');
        return 'dry-run-category-id';
    }

    // Check if exists
    const slug = generateSlug(categoryName);
    const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

    if (existing) {
        categoryMap.set(categoryName, existing.id);
        return existing.id;
    }

    // Create new category
    if (config.autoCreateCategories) {
        const { data: newCat, error } = await supabase
            .from('categories')
            .insert([{
                name: categoryName,
                slug: slug,
                color: '#3B82F6',
                blog_id: config.defaultBlogId
            }])
            .select('id')
            .single();

        if (!error && newCat) {
            categoryMap.set(categoryName, newCat.id);
            console.log(chalk.green(`  ✓ Created category: ${categoryName}`));
            return newCat.id;
        }
    }

    // Fallback to default
    return config.defaultCategoryId;
}

// Parse WordPress XML
async function parseXMLFile(filePath) {
    console.log(chalk.blue(`\n📄 Parsing ${filePath}...`));

    try {
        const xmlContent = await fs.readFile(filePath, 'utf-8');
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
            trim: true
        });

        const result = await parser.parseStringPromise(xmlContent);
        const items = result.rss.channel.item || [];
        const posts = Array.isArray(items) ? items : [items];

        console.log(chalk.green(`✓ Found ${posts.length} items in ${filePath}`));
        return posts;
    } catch (error) {
        console.error(chalk.red(`✗ Error parsing ${filePath}:`), error.message);
        return [];
    }
}

// Transform WordPress post to Supabase article
async function transformPost(wpPost, existingSlugs) {
    try {
        // Helper to extract text from XML fields (can be string or object)
        const getText = (field) => {
            if (!field) return '';
            if (typeof field === 'string') return field;
            if (field._) return field._; // Text content in object
            if (typeof field === 'object') return JSON.stringify(field);
            return String(field);
        };

        // Extract data
        const title = getText(wpPost.title) || 'Untitled';
        const content = getText(wpPost['content:encoded']) || getText(wpPost.description) || '';
        const excerpt = getText(wpPost['excerpt:encoded']) || getText(wpPost.description) || '';
        const wpStatus = getText(wpPost['wp:status']) || 'publish';
        const publishedAt = getText(wpPost.pubDate) || getText(wpPost['wp:post_date']) || new Date().toISOString();

        // Skip non-published posts
        if (wpStatus !== 'publish') {
            stats.skipped++;
            return null;
        }

        // Clean content
        const cleanContent = cleanShortcodes(content);

        // Generate slug
        const baseSlug = generateSlug(title);
        const slug = await ensureUniqueSlug(baseSlug, existingSlugs);

        // Extract featured image
        let featuredImage = null;
        const imageMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imageMatch) {
            featuredImage = imageMatch[1];
        }

        // Get category
        let wpCategory = null;
        if (wpPost.category) {
            if (Array.isArray(wpPost.category)) {
                wpCategory = getText(wpPost.category[0]);
            } else {
                wpCategory = getText(wpPost.category);
            }
        }
        const categoryId = await getOrCreateCategory(wpCategory);

        // Calculate reading time
        const readingTime = calculateReadingTime(cleanContent);

        return {
            title,
            slug,
            content: cleanContent,
            excerpt: excerpt.substring(0, 300),
            featured_image: featuredImage,
            status: 'published',
            published_at: new Date(publishedAt).toISOString(),
            author_id: config.defaultAuthorId,
            blog_id: config.defaultBlogId,
            category_id: categoryId,
            read_time: readingTime,  // Changed from reading_time to read_time
            views: 0,
            created_at: new Date(publishedAt).toISOString(),
            updated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error(chalk.red('Error transforming post:'), error.message);
        return null;
    }
}

// Insert batch to Supabase
async function insertBatch(articles, batchNumber) {
    if (config.dryRun) {
        console.log(chalk.yellow(`[DRY RUN] Would insert batch ${batchNumber} with ${articles.length} articles`));
        return { success: articles.length, errors: 0 };
    }

    try {
        const { data, error } = await supabase
            .from('articles')
            .insert(articles)
            .select('id');

        if (error) throw error;

        return { success: data.length, errors: 0 };
    } catch (error) {
        console.error(chalk.red(`Error inserting batch ${batchNumber}:`), error.message);

        // Try inserting one by one
        let success = 0;
        let errorCount = 0;

        for (const article of articles) {
            try {
                const { error: singleError } = await supabase
                    .from('articles')
                    .insert([article]);

                if (singleError) throw singleError;
                success++;
            } catch (err) {
                errorCount++;
                errors.push({
                    title: article.title,
                    slug: article.slug,
                    error: err.message
                });
            }
        }

        return { success, errors: errorCount };
    }
}

// Main migration function
async function migrate() {
    console.log(chalk.bold.cyan('\n🚀 WordPress to Supabase Migration\n'));
    console.log(chalk.gray('Configuration:'));
    console.log(chalk.gray(`  - Batch Size: ${config.batchSize}`));
    console.log(chalk.gray(`  - Concurrent Requests: ${config.concurrentRequests}`));
    console.log(chalk.gray(`  - Dry Run: ${config.dryRun}`));
    console.log(chalk.gray(`  - Auto Create Categories: ${config.autoCreateCategories}`));
    console.log(chalk.gray(`  - XML Files: ${config.xmlFiles.length}`));

    // Validate configuration
    if (!config.supabaseUrl || !config.supabaseKey) {
        console.error(chalk.red('\n✗ Missing Supabase credentials in .env'));
        process.exit(1);
    }

    if (!config.defaultAuthorId || !config.defaultBlogId) {
        console.error(chalk.red('\n✗ Missing DEFAULT_AUTHOR_ID or DEFAULT_BLOG_ID in .env'));
        console.log(chalk.yellow('\nRun: npm run get-ids'));
        process.exit(1);
    }

    if (config.xmlFiles.length === 0) {
        console.error(chalk.red('\n✗ No XML files specified in .env'));
        process.exit(1);
    }

    // Parse all XML files
    const allPosts = [];
    for (const xmlFile of config.xmlFiles) {
        const posts = await parseXMLFile(xmlFile);
        allPosts.push(...posts);
    }

    stats.total = allPosts.length;
    console.log(chalk.bold.green(`\n✓ Total posts found: ${stats.total}\n`));

    // Get existing slugs to avoid duplicates
    const existingSlugs = new Set();
    if (!config.dryRun) {
        const { data: existingArticles } = await supabase
            .from('articles')
            .select('slug');

        if (existingArticles) {
            existingArticles.forEach(a => existingSlugs.add(a.slug));
            console.log(chalk.yellow(`Found ${existingSlugs.size} existing articles in database\n`));
        }
    }

    // Transform posts
    console.log(chalk.blue('📝 Transforming posts...\n'));
    const articles = [];

    for (const post of allPosts) {
        const article = await transformPost(post, existingSlugs);
        if (article) articles.push(article);
    }

    console.log(chalk.green(`✓ Transformed ${articles.length} articles (skipped ${stats.skipped})\n`));

    // Create batches
    const batches = [];
    for (let i = 0; i < articles.length; i += config.batchSize) {
        batches.push(articles.slice(i, i + config.batchSize));
    }

    console.log(chalk.blue(`📦 Created ${batches.length} batches\n`));

    if (config.autoCreateCategories) {
        console.log(chalk.green(`✓ Created ${categoryMap.size} categories\n`));
    }

    // Progress bar
    const progressBar = new cliProgress.SingleBar({
        format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Articles || ETA: {eta}s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    progressBar.start(articles.length, 0);

    // Process batches with concurrency limit
    const limit = pLimit(config.concurrentRequests);
    const batchPromises = batches.map((batch, index) =>
        limit(async () => {
            const result = await insertBatch(batch, index + 1);
            stats.success += result.success;
            stats.errors += result.errors;
            stats.processed += batch.length;
            progressBar.update(stats.processed);

            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 100));
        })
    );

    await Promise.all(batchPromises);
    progressBar.stop();

    // Final statistics
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);

    console.log(chalk.bold.green('\n\n✅ Migration Complete!\n'));
    console.log(chalk.gray('Statistics:'));
    console.log(chalk.green(`  ✓ Successful: ${stats.success}`));
    console.log(chalk.red(`  ✗ Errors: ${stats.errors}`));
    console.log(chalk.yellow(`  ⊘ Skipped: ${stats.skipped}`));
    console.log(chalk.cyan(`  📁 Categories Created: ${categoryMap.size}`));
    console.log(chalk.blue(`  ⏱ Duration: ${duration}s`));
    console.log(chalk.blue(`  ⚡ Rate: ${(stats.success / parseFloat(duration)).toFixed(2)} articles/second`));

    // Save errors to file
    if (errors.length > 0) {
        await fs.writeFile(
            './migration-errors.json',
            JSON.stringify(errors, null, 2)
        );
        console.log(chalk.yellow(`\n⚠ Errors saved to migration-errors.json`));
    }

    console.log('\n');
}

// Run migration
migrate().catch(error => {
    console.error(chalk.red('\n✗ Fatal error:'), error);
    process.exit(1);
});
