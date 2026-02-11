'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Passport, 
  FileCheck, 
  Briefcase, 
  GraduationCap,
  Users,
  Scale,
  ArrowRight,
  Star,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function ImigracaoPage() {
  const visaTypes = [
    {
      title: 'Visto de Trabalho (H-1B)',
      description: 'Para profissionais especializados com oferta de emprego nos EUA',
      requirements: ['Diploma universitário', 'Oferta de emprego', 'Especialidade na área'],
      duration: '3 anos (renovável)',
      color: 'bg-blue-500',
      popular: true
    },
    {
      title: 'Green Card (Residência)',
      description: 'Residência permanente através de trabalho, família ou loteria',
      requirements: ['Categoria específica', 'Processo burocrático', 'Paciência (anos)'],
      duration: 'Permanente',
      color: 'bg-green-500',
      popular: true
    },
    {
      title: 'Visto de Estudante (F-1)',
      description: 'Para estudar em universidades ou escolas de inglês',
      requirements: ['Carta da instituição', 'Comprovação financeira', 'Inglês básico'],
      duration: 'Duração do curso',
        color: 'bg-purple-500',
      popular: false
    },
    {
      title: 'Visto de Investidor (E-2)',
      description: 'Para empreendedores que investem em negócio nos EUA',
      requirements: ['Investimento substancial', 'Negócio viável', 'Cidadania de país elegível'],
      duration: '2 anos (renovável)',
      color: 'bg-orange-500',
      popular: false
    },
    {
      title: 'Asilo',
      description: 'Para quem tem medo fundamentado de perseguição no país de origem',
      requirements: ['Medo de perseguição', 'Prova documental', 'Prazo de 1 ano'],
      duration: 'Permanente (se aprovado)',
      color: 'bg-red-500',
      popular: false
    },
    {
      title: 'Visto de Turista (B-1/B-2)',
      description: 'Para visitar os EUA a turismo, negócios ou tratamento médico',
      requirements: ['Passaporte válido', 'Comprovação de vínculos', 'Recursos financeiros'],
      duration: 'Até 6 meses',
      color: 'bg-indigo-500',
      popular: false
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Defina seu Objetivo',
      description: 'Entenda qual visto melhor se encaixa na sua situação e perfil',
      icon: Target
    },
    {
      number: '02',
      title: 'Reúna Documentos',
      description: 'Passeportes, certidões, diplomas, comprovantes financeiros',
      icon: FileCheck
    },
    {
      number: '03',
      title: 'Preencha Formulários',
      description: 'DS-160, I-129, I-485 ou formulários específicos do seu visto',
      icon: FileText
    },
    {
      number: '04',
      title: 'Pague Taxas',
      description: 'Taxas de aplicação variam de US$ 160 a US$ 4.000+',
      icon: DollarSign
    },
    {
      number: '05',
      title: 'Entrevista no Consulado',
      description: 'Agende e prepare-se para a entrevista com o oficial consular',
      icon: Users
    }
  ];

  const resources = [
    {
      title: 'USCIS Oficial',
      description: 'Site oficial do serviço de imigração dos EUA',
      url: 'https://www.uscis.gov',
      icon: Shield
    },
    {
      title: 'Embaixada EUA no Brasil',
      description: 'Informações sobre vistos e entrevistas',
      url: 'https://br.usembassy.gov',
      icon: Building
    },
    {
      title: 'CEAC Status',
      description: 'Acompanhe o status da sua aplicação',
      url: 'https://ceac.state.gov',
      icon: Clock
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
              backgroundImage: 'url(https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=1920&q=80)' 
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
              <Passport className="w-4 h-4" />
              Guia de Imigração
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Imigração para os <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">EUA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Tudo sobre vistos, green card e regularização. 
              Guia completo desde a aplicação até a residência permanente.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#vistos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                Tipos de Visto
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#processo"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm transition-all"
              >
                <Scale className="w-5 h-5" />
                Como Funciona
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visa Types */}
      <section id="vistos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Tipos de Visto</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Conheça as principais categorias de vistos e escolha a melhor para seu perfil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visaTypes.map((visa, index) => (
              <motion.div
                key={visa.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {visa.popular && (
                  <div className="absolute -top-3 left-4 z-10">
                    <span className="px-3 py-1 bg-yellow-500 text-slate-950 text-xs font-bold rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="h-full p-8 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:bg-slate-900">
                  <div className={`inline-flex p-4 rounded-xl ${visa.color} bg-opacity-10 mb-6`}>
                    <Passport className={`w-8 h-8 ${visa.color.replace('bg-', 'text-')}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {visa.title}
                  </h3>
                  
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                    {visa.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Requisitos:</span>
                      <ul className="mt-2 space-y-1">
                        {visa.requirements.map((req, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Duração:</span>
                      <p className="text-sm text-white font-medium mt-1">{visa.duration}</p>
                    </div>
                  </div>
                  
                  <Link
                    href={`/imigracao/${visa.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group-hover:gap-3"
                  >
                    Saiba mais
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section id="processo" className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">O Processo de Imigração</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Passo a passo desde a decisão até a chegada aos EUA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-black text-xl mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">Links Oficiais</h2>
            <p className="text-slate-400">Fontes confiáveis para acompanhar seu processo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-white/10 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <resource.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Scale className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Aviso Importante</h3>
                <p className="text-slate-300 leading-relaxed">
                  Este guia tem caráter informativo. A imigração é um processo complexo e 
                  sujeito a mudanças frequentes nas leis. Recomendamos sempre consultar um 
                  advogado de imigração licenciado para casos específicos. Não nos 
                  responsabilizamos por decisões tomadas baseadas apenas neste conteúdo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
