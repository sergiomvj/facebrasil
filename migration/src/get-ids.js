import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function getIds() {
    console.log(chalk.bold.cyan('\n🔍 Fetching Required IDs from Supabase\n'));

    try {
        // Get Author ID
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email')
            .limit(1);

        if (profiles && profiles.length > 0) {
            console.log(chalk.green('✓ Author ID:'));
            console.log(chalk.gray(`  DEFAULT_AUTHOR_ID=${profiles[0].id}`));
            console.log(chalk.gray(`  Name: ${profiles[0].name || 'N/A'}`));
            console.log(chalk.gray(`  Email: ${profiles[0].email || 'N/A'}\n`));
        } else {
            console.log(chalk.yellow('⚠ No profiles found. Create one first!\n'));
        }

        // Get Blog ID
        const { data: blogs } = await supabase
            .from('blogs')
            .select('id, name')
            .limit(1);

        if (blogs && blogs.length > 0) {
            console.log(chalk.green('✓ Blog ID:'));
            console.log(chalk.gray(`  DEFAULT_BLOG_ID=${blogs[0].id}`));
            console.log(chalk.gray(`  Name: ${blogs[0].name || 'N/A'}\n`));
        } else {
            console.log(chalk.yellow('⚠ No blogs found. Create one first!\n'));
        }

        // Get Category ID
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug')
            .limit(5);

        if (categories && categories.length > 0) {
            console.log(chalk.green('✓ Available Categories:'));
            categories.forEach(cat => {
                console.log(chalk.gray(`  ${cat.id} - ${cat.name} (${cat.slug})`));
            });
            console.log(chalk.gray(`\n  DEFAULT_CATEGORY_ID=${categories[0].id}\n`));
        } else {
            console.log(chalk.yellow('⚠ No categories found. Create one first!\n'));
        }

        // Summary
        console.log(chalk.bold.cyan('📋 Copy these to your .env file:\n'));
        console.log(chalk.white(`DEFAULT_AUTHOR_ID=${profiles?.[0]?.id || 'MISSING'}`));
        console.log(chalk.white(`DEFAULT_BLOG_ID=${blogs?.[0]?.id || 'MISSING'}`));
        console.log(chalk.white(`DEFAULT_CATEGORY_ID=${categories?.[0]?.id || 'MISSING'}\n`));

    } catch (error) {
        console.error(chalk.red('✗ Error:'), error.message);
    }
}

getIds();
