import { EventItem, EventType, Package } from '@/types';
import { resolveEventPackage, ResolvedPackageInfo } from './utils';

export type BriefingProfile =
  | 'casamento'
  | '15_anos'
  | 'aniversario'
  | 'ensaio'
  | 'formatura'
  | 'corporativo'
  | 'esportivo'
  | 'outro';

export type BriefingStepId =
  | 'event_info'
  | 'ceremony'
  | 'people'
  | 'required_photos'
  | 'special_moments'
  | 'party'
  | 'preferences'
  | 'video';

export interface BriefingStepDef {
  id: BriefingStepId;
  title: string;
  subtitle: string;
  shortLabel: string;
}

export interface BriefingContext {
  profile: BriefingProfile;
  eventType: EventType;
  packageInfo: ResolvedPackageInfo | null;
  hasMakingOf: boolean;
  hasVideo: boolean;
  hasCeremony: boolean;
  hasParty: boolean;
  hasSpecialMoments: boolean;
  steps: BriefingStepDef[];
  peopleCategories: string[];
  defaultRequiredPhotos: Array<{ id: string; description: string; people_involved: string }>;
  copy: {
    headerSubtitle: string;
    dateLabel: string;
    arrivalLabel: string;
    showCeremonyTimeAndLocation: boolean;
    ceremonyTimeLabel: string;
    ceremonyLocationLabel: string;
    ceremonyLocationPlaceholder: string;
    receptionTimeLabel: string;
    receptionLocationLabel: string;
    receptionLocationPlaceholder: string;
    makingOfLabel: string;
    makingOfPlaceholder: string;
    ceremonyTypeLabel: string;
    ceremonyTypePlaceholder: string;
    celebrantLabel: string;
    celebrantPlaceholder: string;
    entourageHeading: string;
    parentsEntranceLabel: string;
    godparentsEntranceLabel: string;
    pagesFlowerGirlsLabel: string;
    specialEntrancesLabel: string;
    specialEntrancesPlaceholder: string;
    ceremonyNotesLabel: string;
    personNamePlaceholder: string;
    personNotesPlaceholder: string;
    photoDescPlaceholder: string;
    photoPeoplePlaceholder: string;
    surprisePlaceholder: string;
    tributePlaceholder: string;
    speechLabel: string;
    speechPlaceholder: string;
    danceLabel: string;
    dancePlaceholder: string;
    attractionsLabel: string;
    attractionsPlaceholder: string;
    gamesLabel: string;
    gamesPlaceholder: string;
    noPhotoPlaceholder: string;
    musicLabel: string;
    musicPlaceholder: string;
    essentialFilmPlaceholder: string;
    testimonialsLabel: string;
  };
}

const VIDEO_KEYWORD_REGEX =
  /\b(v[ií]deo|filmagem|filme|cinema|cinematografia|trailer|melhores momentos|reels|story\s*maker|storymaker|aftermovie|teaser)\b/i;

const MAKING_OF_KEYWORD_REGEX =
  /(making\s*of+|bastidores|preparo\s+da\s+(noiva|debutante)|make\s*e\s*cabelo)/i;

export function mapEventTypeToProfile(type?: EventType | string): BriefingProfile {
  switch (type) {
    case 'Casamento':
      return 'casamento';
    case '15 anos':
      return '15_anos';
    case 'Aniversário':
      return 'aniversario';
    case 'Ensaio':
      return 'ensaio';
    case 'Formatura':
      return 'formatura';
    case 'Corporativo':
      return 'corporativo';
    case 'Esportivo':
      return 'esportivo';
    default:
      return 'outro';
  }
}

function getPeopleCategories(profile: BriefingProfile): string[] {
  switch (profile) {
    case 'casamento':
      return [
        'Pais da noiva',
        'Pais do noivo',
        'Padrinhos',
        'Avós',
        'Irmãos',
        'Filhos',
        'Amigos',
        'Outras pessoas',
      ];
    case '15_anos':
      return [
        'Debutante',
        'Pais da debutante',
        'Irmãos',
        'Avós',
        '15 Casais / Corte',
        'Melhores Amigos(as)',
        'Outras pessoas',
      ];
    case 'aniversario':
      return [
        'Aniversariante',
        'Pais',
        'Filhos',
        'Cônjuge / Par',
        'Avós',
        'Irmãos',
        'Amigos',
        'Outras pessoas',
      ];
    case 'formatura':
      return [
        'Formando(a)',
        'Pais',
        'Irmãos',
        'Avós',
        'Amigos / Turma',
        'Homenageados / Professores',
        'Outras pessoas',
      ];
    case 'ensaio':
      return [
        'Participante Principal',
        'Cônjuge / Par',
        'Filhos',
        'Família',
        'Pet',
        'Outras pessoas',
      ];
    case 'corporativo':
      return [
        'Anfitrião / Organização',
        'Diretoria / Liderança',
        'Palestrante / VIP',
        'Equipe / Time',
        'Outras pessoas',
      ];
    case 'esportivo':
      return [
        'Atleta / Organizador',
        'Treinador / Equipe Técnica',
        'Pódio / Premiação',
        'Patrocinadores',
        'Outras pessoas',
      ];
    default:
      return [
        'Anfitrião / Homenageado',
        'Família',
        'Amigos / Convidados',
        'Equipe / Organização',
        'Outras pessoas',
      ];
  }
}

export function getDefaultRequiredPhotosForType(
  type?: EventType | string
): Array<{ id: string; description: string; people_involved: string }> {
  const profile = mapEventTypeToProfile(type);
  switch (profile) {
    case 'casamento':
      return [
        { id: 'rp-d1', description: 'Foto com os pais no altar', people_involved: 'Pais' },
        { id: 'rp-d2', description: 'Foto com padrinhos e madrinhas', people_involved: 'Padrinhos' },
      ];
    case '15_anos':
      return [
        { id: 'rp-d1', description: 'Foto oficial da debutante com os pais e avós', people_involved: 'Família' },
        { id: 'rp-d2', description: 'Foto com as amigas e corte na mesa do bolo', people_involved: 'Amigos' },
      ];
    case 'aniversario':
      return [
        { id: 'rp-d1', description: 'Foto com a família na mesa do bolo / parabéns', people_involved: 'Família' },
        { id: 'rp-d2', description: 'Foto em grupo com os amigos próximos', people_involved: 'Amigos' },
      ];
    case 'ensaio':
      return [
        { id: 'rp-d1', description: 'Retratos espontâneos em movimento e detalhes', people_involved: 'Participantes' },
      ];
    case 'formatura':
      return [
        { id: 'rp-d1', description: 'Foto oficial com pais e familiares', people_involved: 'Família' },
        { id: 'rp-d2', description: 'Foto com a turma e amigos próximos', people_involved: 'Turma' },
      ];
    case 'corporativo':
      return [
        { id: 'rp-d1', description: 'Foto oficial da equipe / diretoria reunida', people_involved: 'Equipe' },
      ];
    case 'esportivo':
      return [
        { id: 'rp-d1', description: 'Registros em ação, largada/chegada e pódio', people_involved: 'Atletas' },
      ];
    default:
      return [
        { id: 'rp-d1', description: 'Foto com familiares e convidados principais', people_involved: 'Convidados' },
      ];
  }
}

/**
 * Monta o contexto completo do briefing com base no tipo do evento,
 * pacote contratado, adicionais e sessões extras.
 */
export function buildBriefingContext(
  event?: Pick<
    EventItem,
    | 'type'
    | 'package_name'
    | 'package_id'
    | 'package_description'
    | 'addons'
    | 'extra_sessions'
    | 'description'
  > | null,
  packages: Package[] = []
): BriefingContext {
  const eventType: EventType = event?.type || 'Casamento';
  const profile = mapEventTypeToProfile(eventType);

  const packageInfo = event
    ? resolveEventPackage(
        packages,
        event.package_name,
        event.package_id,
        event.package_description
      )
    : null;

  const combinedText = [
    packageInfo?.name || '',
    packageInfo?.description || '',
    ...(packageInfo?.features || []),
    ...(event?.addons || []).map((a) => a.name),
    ...(event?.extra_sessions || []).map((s) => s.label),
    event?.description || '',
  ]
    .join(' ')
    .toLowerCase();

  const hasVideo = VIDEO_KEYWORD_REGEX.test(combinedText);
  const hasMakingOf = MAKING_OF_KEYWORD_REGEX.test(combinedText);

  const hasCeremony =
    profile === 'casamento' || profile === '15_anos' || profile === 'formatura';
  const hasParty =
    profile === 'casamento' ||
    profile === '15_anos' ||
    profile === 'aniversario' ||
    profile === 'formatura' ||
    profile === 'outro';
  const hasSpecialMoments = profile !== 'ensaio' && profile !== 'esportivo';

  const mediaFocusText = hasVideo ? 'foto e vídeo' : 'fotografia';

  const steps: BriefingStepDef[] = [
    {
      id: 'event_info',
      title:
        profile === 'ensaio'
          ? 'Locais e Horário do Ensaio'
          : 'Informações do Evento',
      subtitle:
        profile === 'ensaio'
          ? `Alinhe ponto de encontro, horário e logística para ${mediaFocusText}.`
          : `Horários e locais previstos para a equipe de ${mediaFocusText}.`,
      shortLabel: 'Locais & Horários',
    },
  ];

  if (hasCeremony) {
    steps.push({
      id: 'ceremony',
      title:
        profile === '15_anos'
          ? 'Cerimonial & Protocolo dos 15 Anos'
          : profile === 'formatura'
            ? 'Cerimônia & Protocolo de Colação'
            : 'Detalhes da Cerimônia',
      subtitle:
        profile === '15_anos'
          ? 'Entradas, valsa, cerimonialista e roteiro dos momentos protocolares.'
          : profile === 'formatura'
            ? 'Entradas, protocolo oficial e homenagens da colação.'
            : 'Entradas, celebrante e dinâmica do cortejo.',
      shortLabel: profile === '15_anos' ? 'Cerimonial' : 'Cerimônia',
    });
  }

  steps.push({
    id: 'people',
    title: profile === 'ensaio' ? 'Participantes do Ensaio' : 'Pessoas Importantes',
    subtitle:
      profile === 'ensaio'
        ? 'Quem participará da sessão e detalhes importantes sobre cada pessoa.'
        : 'Familiares, convidados ou pessoas-chave que devem ter atenção especial da equipe.',
    shortLabel: 'Pessoas',
  });

  steps.push({
    id: 'required_photos',
    title: 'Fotos Que Não Podem Faltar',
    subtitle:
      profile === 'ensaio'
        ? 'Poses, enquadramentos ou combinações que você faz questão de registrar.'
        : 'Fotos protocolares, com a família, amigos ou cenas que você faz questão absoluta.',
    shortLabel: 'Fotos Obrigatórias',
  });

  if (hasSpecialMoments) {
    steps.push({
      id: 'special_moments',
      title: 'Momentos Especiais & Surpresas',
      subtitle:
        'Avise nossa equipe com antecedência para prepararmos a melhor posição e iluminação.',
      shortLabel: 'Momentos',
    });
  }

  if (hasParty) {
    steps.push({
      id: 'party',
      title:
        profile === 'aniversario'
          ? 'Dinâmica da Festa & Parabéns'
          : 'Dinâmica da Festa',
      subtitle:
        profile === 'aniversario'
          ? 'Atrações, hora do parabéns e momentos que NÃO devem ser fotografados.'
          : 'Atrações musicais, interações e momentos que NÃO devem ser fotografados.',
      shortLabel: 'Festa',
    });
  }

  steps.push({
    id: 'preferences',
    title: 'Preferências Fotográficas',
    subtitle: 'Alinhe a linguagem estética das suas fotos com a nossa equipe.',
    shortLabel: 'Preferências',
  });

  if (hasVideo) {
    steps.push({
      id: 'video',
      title: 'Direção de Vídeo & Cinema',
      subtitle: 'Músicas marcantes, falas essenciais e narrativa do seu filme.',
      shortLabel: 'Vídeo',
    });
  }

  const copy: BriefingContext['copy'] = {
    headerSubtitle: hasVideo
      ? `${eventType} — Cobertura de Foto & Vídeo`
      : `${eventType} — Cobertura Fotográfica`,
    dateLabel: profile === 'ensaio' ? 'Data do Ensaio' : 'Data do Evento',
    arrivalLabel:
      profile === 'ensaio'
        ? 'Horário de Encontro com a Equipe'
        : 'Horário de Chegada da Equipe',
    showCeremonyTimeAndLocation: profile === 'casamento',
    ceremonyTimeLabel: 'Horário da Cerimônia',
    ceremonyLocationLabel: 'Local da Cerimônia',
    ceremonyLocationPlaceholder: 'Ex: Paróquia Nossa Senhora do Brasil',
    receptionTimeLabel:
      profile === 'casamento'
        ? 'Horário da Recepção / Festa'
        : profile === 'ensaio'
          ? 'Horário de Início do Ensaio'
          : profile === 'corporativo' || profile === 'esportivo'
            ? 'Horário de Início do Evento'
            : 'Horário da Festa / Evento',
    receptionLocationLabel:
      profile === 'casamento'
        ? 'Local da Recepção'
        : profile === 'ensaio'
          ? 'Locação / Local do Ensaio'
          : 'Local do Evento',
    receptionLocationPlaceholder:
      profile === 'ensaio'
        ? 'Ex: Parque Barigui / Studio G&C'
        : 'Ex: Salão de Festas / Espaço do Evento',
    makingOfLabel:
      profile === '15_anos'
        ? 'Endereço do Making Of (Debutante)'
        : profile === 'casamento'
          ? 'Endereço do Making Of (Noiva/Noivo)'
          : 'Endereço do Making Of',
    makingOfPlaceholder: 'Ex: Hotel / Salão / Residência - Rua e número',
    ceremonyTypeLabel:
      profile === '15_anos'
        ? 'Formato do Cerimonial'
        : profile === 'formatura'
          ? 'Tipo de Cerimônia'
          : 'Tipo de Cerimônia',
    ceremonyTypePlaceholder:
      profile === '15_anos'
        ? 'Ex: Tradicional (15 casais + valsa), Moderno direto para festa, etc.'
        : profile === 'formatura'
          ? 'Ex: Colação oficial + jantar/baile'
          : 'Ex: Religiosa, Ecumênica, Civil no local, etc.',
    celebrantLabel:
      profile === '15_anos'
        ? 'Cerimonialista / Mestre de Cerimônias'
        : profile === 'formatura'
          ? 'Cerimonial / Orador(es)'
          : 'Quem celebrará?',
    celebrantPlaceholder:
      profile === '15_anos'
        ? 'Ex: Nome da cerimonialista ou DJ que conduzirá o protocolo'
        : profile === 'formatura'
          ? 'Ex: Empresa de formatura / Mestre de cerimônias'
          : 'Ex: Padre Michelino / Pastor Paulo / Amigo da família',
    entourageHeading:
      profile === '15_anos' ? 'Roteiro de Entradas e Protocolo:' : 'Cortejo de Entradas:',
    parentsEntranceLabel:
      profile === '15_anos'
        ? 'Haverá entrada dos pais / familiares no protocolo?'
        : 'Haverá entrada dos pais?',
    godparentsEntranceLabel:
      profile === '15_anos'
        ? 'Haverá corte / entrada dos 15 casais ou amigas?'
        : profile === 'formatura'
          ? 'Haverá entrada dos padrinhos / professores?'
          : 'Haverá entrada de padrinhos?',
    pagesFlowerGirlsLabel:
      profile === '15_anos'
        ? 'Haverá troca de sapato, coroa ou anel?'
        : profile === 'formatura'
          ? 'Haverá homenagens protocolares no palco?'
          : 'Haverá pajens / daminhas?',
    specialEntrancesLabel:
      profile === '15_anos'
        ? 'Existem entradas ou trocas de vestido especiais?'
        : 'Existem entradas especiais?',
    specialEntrancesPlaceholder:
      profile === '15_anos'
        ? 'Ex: Entrada com vestido de gala, entrada com avô ou irmão...'
        : 'Ex: Avó trazendo as alianças, pet na cerimônia, etc.',
    ceremonyNotesLabel:
      profile === '15_anos' ? 'Observações do Cerimonial' : 'Observações da Cerimônia',
    personNamePlaceholder:
      profile === '15_anos'
        ? 'Nome da pessoa (ex: Mãe Ana / Avó Maria)'
        : profile === 'corporativo'
          ? 'Nome da pessoa (ex: Diretor Carlos)'
          : 'Nome da pessoa (ex: Avó Maria)',
    personNotesPlaceholder:
      'Observação (ex: Precisa aparecer bastante nas fotos / mobilidade reduzida)',
    photoDescPlaceholder:
      profile === '15_anos'
        ? 'Descrição (ex: Foto com as 15 amigas na mesa do bolo)'
        : profile === 'aniversario'
          ? 'Descrição (ex: Foto com toda a família na hora do parabéns)'
          : profile === 'ensaio'
            ? 'Descrição (ex: Foto com o pôr do sol ao fundo / com o pet)'
            : profile === 'corporativo'
              ? 'Descrição (ex: Foto oficial com todo o time no palco)'
              : 'Descrição (ex: Foto com os casais de padrinhos no altar)',
    photoPeoplePlaceholder:
      profile === '15_anos'
        ? 'Pessoas envolvidas (ex: Debutante e Corte / Pais)'
        : profile === 'aniversario'
          ? 'Pessoas envolvidas (ex: Aniversariante e Pais / Amigos)'
          : 'Pessoas envolvidas (ex: Padrinhos / Família)',
    surprisePlaceholder:
      profile === '15_anos'
        ? 'Ex: Troca surpresa para a balada, homenagem da família, presente especial...'
        : profile === 'aniversario'
          ? 'Ex: Vídeo surpresa, convidado especial, show surpresa...'
          : profile === 'corporativo'
            ? 'Ex: Premiação surpresa de colaborador, revelação de marca...'
            : 'Ex: O noivo tocará saxofone, entrada surpresa de alguém especial...',
    tributePlaceholder:
      profile === 'aniversario'
        ? 'Descreva se haverá vídeo no telão, carta ou entrega de presente especial.'
        : 'Descreva se haverá vídeo, entrega de buquê ou presente especial.',
    speechLabel:
      profile === '15_anos'
        ? 'Haverá discursos dos pais, amigos ou da debutante?'
        : profile === 'corporativo'
          ? 'Haverá falas institucionais ou palestras principais?'
          : 'Haverá discursos durante o brinde ou jantar?',
    speechPlaceholder: 'Quem falará e em qual momento?',
    danceLabel:
      profile === '15_anos'
        ? 'Haverá valsa tradicional ou valsa maluca / coreografia?'
        : profile === 'aniversario'
          ? 'Haverá dança ou apresentação especial na festa?'
          : 'Haverá dança coreografada especial?',
    dancePlaceholder:
      profile === '15_anos'
        ? 'Ex: Valsa com pai e padrinho + dança coreografada com amigas'
        : 'Ex: Valsa coreografada com os padrinhos / dança divertida',
    attractionsLabel:
      profile === '15_anos'
        ? 'Haverá atrações na festa? (DJ, pista neon, robô de LED, bartender, etc.)'
        : profile === 'aniversario'
          ? 'Haverá atrações na festa? (Recreação, banda, DJ, mágico, etc.)'
          : 'Haverá atrações na festa? (Bandas, DJs convidados, robô de LED, etc.)',
    attractionsPlaceholder:
      profile === '15_anos'
        ? 'Ex: DJ com balada neon à 00h e robô de LED'
        : profile === 'aniversario'
          ? 'Ex: Banda ao vivo às 20h e recreação infantil'
          : 'Ex: Banda de rock às 23h e escola de samba à 01h',
    gamesLabel:
      profile === 'casamento'
        ? 'Brincadeiras da festa (Buquê com fitas, hora do sapato, gravata)'
        : profile === '15_anos'
          ? 'Dinâmicas e momentos da balada (Cabine, chuva de papel, parabéns)'
          : 'Dinâmicas e momentos da festa (Hora do parabéns, retrospectiva, jogos)',
    gamesPlaceholder:
      profile === 'casamento'
        ? 'Descreva as brincadeiras previstas'
        : 'Descreva as dinâmicas ou momentos importantes da festa',
    noPhotoPlaceholder:
      'Ex: Evitar fotos dos convidados comendo no buffet / momentos de descanso',
    musicLabel:
      profile === 'casamento'
        ? 'Existe alguma música muito importante na história do casal?'
        : profile === '15_anos'
          ? 'Qual música da valsa ou trilha favorita para o vídeo?'
          : 'Existe alguma música especial para a trilha do vídeo?',
    musicPlaceholder: 'Ex: Nome da música e artista especial',
    essentialFilmPlaceholder:
      profile === '15_anos'
        ? 'Ex: Abertura da valsa, reação dos pais no making of, entrada na festa...'
        : profile === 'aniversario'
          ? 'Ex: Momento do parabéns, abraços da família, discursos...'
          : 'Ex: O abraço emocionado com a avó, os votos, etc.',
    testimonialsLabel:
      profile === 'casamento'
        ? 'Gostariam que nossa equipe gravasse depoimentos rápidos de amigos e pais durante a festa?'
        : profile === '15_anos'
          ? 'Gostariam que nossa equipe gravasse recados e depoimentos de pais e amigas para a debutante?'
          : profile === 'corporativo'
            ? 'Haverá gravação de depoimentos de participantes, clientes ou diretores?'
            : 'Gostariam que nossa equipe gravasse depoimentos rápidos durante o evento?',
  };

  return {
    profile,
    eventType,
    packageInfo,
    hasMakingOf,
    hasVideo,
    hasCeremony,
    hasParty,
    hasSpecialMoments,
    steps,
    peopleCategories: getPeopleCategories(profile),
    defaultRequiredPhotos: getDefaultRequiredPhotosForType(eventType),
    copy,
  };
}
