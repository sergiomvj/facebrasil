Crie um novo item de menu chamado "Virtual Jornalist" que seguira para um novo componente de criação de artigos.

Crie um plano de implementação para um componente de captura de noticias que traga :

1 - as 20 principais noticias sobre brasileiros no exterior do dia, em qualquer idioma, sobre qualquer assunto ;
2 - As principais noticias locais e fatos relevantes do dia vinculadas as seguintes regioes:

Flórida: Grande Miami Condado de Dade( todas as cidades no entorno ) , Condado de Broward ( todas as cidades )e Fort Lauderdale por Orlando e todo o Condado de Orange ( Todas as cidades )

Massachusetts: A região da Grande Boston e todas as demais cidades como Framingham. 

Nova York e Nova Jersey: A área metropolitana de Nova York possui uma das maiores populações de brasileiros em números absolutos. Em Nova Jersey, cidades menores como East Newark e Harrison têm as maiores concentrações de imigrantes e descendentes.

Califórnia: Concentra milhares de brasileiros divididos entre os condados de Los Angeles, San Diego, Santa Clara e Contra Costa

A busca de artigo obdecerá os criterios da skill [brazilian-Jornalist_skill](file;file:///f%3A/Projetos/2FBR-NovaFacebrasil/components/VirtualJornalist/brazilian-Jornalist_skill) 

- Adicionar suporte a RSS feeds das fontes 
- Integração com Google News API como fallback
- Detecção de paywall e fallback para archive.org


Os artigos encontrados deverão ter os links, titulos, link da imagem e veiculo salvos  no banco de dados ( Supabase ), traduzidos para o portugues e ficarão disponiveis para todos os autores de revista ( virtuais ou nào )

Apos capturados as fontes terao uma fase de processamento para :

- Análise de sentimento (positivo/negativo/neutro)
- Detecção de trending topics (notícias que estão viralizando)
- Cross-reference com mídia BR (mesmo fato, ângulos diferentes)

O componente então oferecerá aos usuários uma lista de fontes para serem selecionados para geraçào de novos artigos, contextualizados para a realidade da Comunidade Brasileira nos Estados Unidos, reescritos e publicados na Revista normalmente, num clique no botào "Reescrever"

Apos ser reescrito o artigo entra no fluxo normal de produção de artigos da revista no endpoint /pt/admin/articles para passar por todas as fases normais de produção e publicado.

As fontes de artigos já utilizadas deverão ser marcadas como "utilizada por nome-do-jornalista" para evitar serem publicadas em duplicidade

Os artigos poderão ser inscritos por diferentes agentes virtuais que deverào ser cadastrados especificando a perfil desses agentes, local onde moram e a forma que esses agentes escrevem para influenciar no texto do artigo - CRUD de autores virtuais

Cada jornalista virtual tera um dashboard  proprio onde a lista de fonte geral será disponibilizada, os artigos do autor estarao listados e  onde todas as configuracoes de preferencias de texto estão feitas de forma customizada 




