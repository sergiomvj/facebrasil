'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  FileText,
  Building2,
  GraduationCap,
  Award,
  ArrowRight,
  Globe,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function TrabalhoPage() {
  const jobAreas = [
    {
      title: 'Tecnologia',
      icon: Briefcase,
      description: 'Engenharia de software, data science, product management',
      avgSalary: '$80k - $150k',
      demand: 'Muito Alta',
      color: 'bg-blue-500'
    },
    {
      title: 'Saúde',
      icon: Building2,
      description: 'Enfermagem, medicina, farmácia, fisioterapia',
      avgSalary: '$60k - $200k',
      demand: 'Alta',
      color: 'bg-green-500'
    },
    {
      title: 'Construção',
      icon: Building2,
      description: 'Pedreiro, eletricista, encanador, supervisor',
      avgSalary: '$35k - $80k',
      demand: 'Alta',
      color: 'bg-orange-500'
    },
    {
      title: 'Gastronomia',
      icon: Award,
      description: 'Chef, garçom, gerente de restaurante',
      avgSalary: '$25k - $60k',
      demand: 'Média',
      color: 'bg-red-500'
    },
    {
      title: 'Limpeza',
      icon: Building2,
      description: 'Limpeza residencial, comercial, hotelaria',
      avgSalary: '$20k - $35k',
      demand: 'Alta',
      color: 'bg-purple-500'
    },
    {
      title: 'Outros Serviços',
      icon: Globe,
      description: 'Motorista, segurança, babá, jardinagem',
      avgSalary: '$20k - $45k',
      demand: 'Média',
      color: 'bg-indigo-500'
    }
  ];

  const requirements = [
    {
      title: 'Autorização de Trabalho',
      description: 'Visto de trabalho (H-1B, L-1, O-1) ou Green Card. Sem documentação válida, não é legal trabalhar.',
      icon: FileText
    },
    {
      title: 'Social Security Number (SSN)',
      description: 'Número de identificação social obrigatório para trabalho formal. Solicite assim que chegar aos EUA.',
      icon: Award
    },
    {
      title: 'Inglês Básico',
      description: 'Nível de inglês varia por área. Tecnologia aceita intermediário, serviços gerais precisam de conversação.',
      icon: Globe
    },
    {
      title: 'Validação de Diploma',
      description: 'Diplomas brasileiros precisam ser validados ( credential evaluation ) para áreas regulamentadas.',
      icon: GraduationCap
    }
  ];

  const tips = [
    {
      title: 'Currículo Americano',
      content: 'Formato diferente do brasileiro. Destaque conquistas quantificáveis, use palavras-chave da vaga e mantenha em 1 página.',
      icon: FileText
    },
    {
      title: 'LinkedIn Otimizado',
      content: '94% dos recrutadores usam LinkedIn. Foto profissional, headline clara, summary com palavras-chave.',
      icon: Globe
    },
    {
      title: 'Networking',
      content: 'Indicações são responsáveis por 85% das contratações. Participe de meetups, eventos da área.',
      icon: TrendingUp
    },
    {
      title: 'Pesquisa Salarial',
      content: 'Use Glassdoor, Indeed Salary, Levels.fyi para saber quanto pedir. Considere custo de vida da cidade.',
      icon: DollarSign
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)' 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white mb-6">
              <Briefcase className="w-4 h-4" />
              Guia Profissional
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Trabalhar nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">EUA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Oportunidades de emprego, salários por área e como conseguir 
              seu primeiro trabalho legalmente nos Estados Unidos.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#areas"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                Áreas de Atuação
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#requisitos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm transition-all"
              >
                <FileText className="w-5 h-5" />
                Requisitos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Job Areas */}
      <section id="areas" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Áreas de Trabalho</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Principais setores que contratam brasileiros e faixas salariais médias
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full p-8 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:bg-slate-900">
                  <div className={`inline-flex p-4 rounded-xl ${area.color} bg-opacity-10 mb-6`}>
                    <area.icon className={`w-8 h-8 ${area.color.replace('bg-', 'text-')}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{area.title}</h3>
                  <p className="text-slate-400 mb-6">{area.description}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Salário médio:</span>
                      <span className="text-white font-bold">{area.avgSalary}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Demanda:</span>
                      <span className={`text-sm font-medium ${
                        area.demand === 'Muito Alta' ? 'text-green-400' :
                        area.demand === 'Alta' ? 'text-blue-400' : 'text-yellow-400'
                      }`}>{area.demand}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requisitos" className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Requisitos para Trabalhar</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Documentação e preparação necessárias para trabalho legal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {requirements.map((req, index) => (
              <motion.div
                key={req.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="p-4 bg-orange-500/10 rounded-xl">
                    <req.icon className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{req.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{req.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Dicas para Conseguir Emprego</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Estratégias que funcionam no mercado de trabalho americano
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/5 rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <tip.icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{tip.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary Calculator CTA */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Quanto você pode ganhar?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Use nossa calculadora de salário para comparar sua área em diferentes cidades americanas.
              Considere custo de vida, impostos e benefícios.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Calculadora de Salário
              <span className="text-xs bg-orange-100 px-2 py-1 rounded">Em breve</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Job Boards */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">Onde Procurar Emprego</h2>
            <p className="text-slate-400">Principais sites de vagas nos EUA</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'LinkedIn Jobs', url: 'https://linkedin.com/jobs' },
              { name: 'Indeed', url: 'https://indeed.com' },
              { name: 'Glassdoor', url: 'https://glassdoor.com' },
              { name: 'ZipRecruiter', url: 'https://ziprecruiter.com' },
            ].map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-900/50 border border-white/5 rounded-xl text-center hover:border-white/10 transition-all"
              >
                <Globe className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <span className="text-white font-medium">{site.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
