'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Home, 
  Car, 
  GraduationCap, 
  Heart,
  ShoppingBag,
  Phone,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { routing } from '@/i18n/routing';

export default function VidaEuaPage() {
  const topics = [
    {
      icon: Home,
      title: 'Moradia',
      description: 'Como encontrar apartamento, entender contratos e escolher o bairro ideal',
      articles: 12,
      color: 'bg-blue-500'
    },
    {
      icon: Car,
      title: 'Transporte',
      description: 'Carteira de motorista, comprar carro, seguro e transporte público',
      articles: 8,
      color: 'bg-green-500'
    },
    {
      icon: GraduationCap,
      title: 'Educação',
      description: 'Escolas públicas e privadas, universidades e cursos de inglês',
      articles: 15,
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Saúde',
      description: 'Seguro saúde, hospitais, médicos e medicamentos nos EUA',
      articles: 10,
      color: 'bg-red-500'
    },
    {
      icon: ShoppingBag,
      title: 'Compras',
      description: 'Supermercados, lojas brasileiras, compras online e economia',
      articles: 6,
      color: 'bg-orange-500'
    },
    {
      icon: Phone,
      title: 'Serviços',
      description: 'Telefonia, internet, bancos, impostos e documentos',
      articles: 14,
      color: 'bg-indigo-500'
    }
  ];

  const featuredArticles = [
    {
      title: 'Guia Completo: Como Alugar um Apartamento nos EUA',
      excerpt: 'Passo a passo desde a busca até a assinatura do contrato, incluindo documentos necessários e valores médios por cidade.',
      image: '/images/housing-guide.jpg',
      category: 'Moradia',
      readTime: '8 min'
    },
    {
      title: 'Como Tirar a Carteira de Motorista em Cada Estado',
      excerpt: 'Requisitos, processo, custos e dicas para passar no exame teórico e prático na primeira vez.',
      image: '/images/drivers-license.jpg',
      category: 'Transporte',
      readTime: '6 min'
    },
    {
      title: 'Entendendo o Sistema de Saúde Americano',
      excerpt: 'HMO, PPO, Obamacare e seguros privados. Como escolher o melhor plano para sua família.',
      image: '/images/healthcare.jpg',
      category: 'Saúde',
      readTime: '10 min'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1920&q=80)' 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white mb-6">
              <MapPin className="w-4 h-4" />
              Guia Completo
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Vida nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">EUA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Tudo que você precisa saber para viver bem nos Estados Unidos. 
              Da documentação ao dia a dia, guias práticos escritos por quem já passou por isso.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#topicos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                Explorar Tópicos
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/fbr-news"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm transition-all"
              >
                <Star className="w-5 h-5" />
                Ver Artigos
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
              {[
                { value: '65+', label: 'Artigos' },
                { value: '12', label: 'Categorias' },
                { value: '50k+', label: 'Leitores' },
                { value: '2024', label: 'Atualizado' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Topics Grid */}
      <section id="topicos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Temas Principais</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Explore os principais aspectos da vida americana com guias detalhados e dicas práticas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/category/${topic.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="h-full p-8 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:bg-slate-900">
                    <div className={`inline-flex p-4 rounded-xl ${topic.color} bg-opacity-10 mb-6`}>
                      <topic.icon className={`w-8 h-8 ${topic.color.replace('bg-', 'text-')}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {topic.title}
                    </h3>
                    
                    <p className="text-slate-400 mb-4 leading-relaxed">
                      {topic.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{topic.articles} artigos</span>
                      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Artigos em Destaque</h2>
              <p className="text-slate-400">Os guias mais lidos e atualizados</p>
            </div>
            <Link 
              href="/fbr-news"
              className="hidden md:inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <motion.article
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${article.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    {article.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <span className="text-xs text-slate-500">{article.readTime} de leitura</span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Tem uma dúvida específica?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Nossa comunidade de brasileiros nos EUA pode ajudar. 
              Participe das discussões e tire suas dúvidas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/comunidade"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Entrar na Comunidade
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
