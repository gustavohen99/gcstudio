import {
  BriefingData,
  ChecklistTask,
  EventItem,
  Package,
  TimelineMoment,
} from '@/types';
import { buildBriefingContext } from './briefing-config';

/**
 * Soma ou subtrai minutos de um horário HH:mm mantendo formato HH:mm.
 */
function shiftTime(baseTime: string | undefined, deltaMinutes: number): string {
  const safe = (baseTime || '16:00').trim();
  const [hStr, mStr] = safe.split(':');
  const h = Number.parseInt(hStr || '16', 10);
  const m = Number.parseInt(mStr || '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return '16:00';
  const total = ((h * 60 + m + deltaMinutes) % 1440 + 1440) % 1440;
  const outH = String(Math.floor(total / 60)).padStart(2, '0');
  const outM = String(total % 60).padStart(2, '0');
  return `${outH}:${outM}`;
}

function getCombinedPackageText(event: EventItem, packages: Package[]): string {
  const ctx = buildBriefingContext(event, packages);
  return [
    ctx.packageInfo?.name || '',
    ctx.packageInfo?.description || '',
    ...(ctx.packageInfo?.features || []),
    ...(event.addons || []).map((a) => a.name),
    ...(event.extra_sessions || []).map((s) => s.label),
    event.description || '',
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Gera o checklist operacional personalizado conforme o tipo de evento,
 * pacote contratado, adicionais (Making Of, Vídeo, Story Maker, Quadro, Ensaio).
 */
export function buildDefaultChecklistForEvent(
  event: EventItem,
  packages: Package[] = []
): ChecklistTask[] {
  const ctx = buildBriefingContext(event, packages);
  const combined = getCombinedPackageText(event, packages);
  const stamp = Date.now();
  const tasks: ChecklistTask[] = [];
  let seq = 1;

  const pushTask = (phase: ChecklistTask['phase'], title: string) => {
    tasks.push({
      id: `chk-${stamp}-${seq++}`,
      event_id: event.id,
      phase,
      title,
      is_completed: false,
    });
  };

  // ANTES DO EVENTO
  pushTask('antes', 'Confirmar briefing preenchido pelo cliente');
  pushTask('antes', 'Carregar baterias e formatar cartões de memória');
  pushTask('antes', 'Limpar lentes e conferir câmera reserva');

  if (ctx.hasVideo) {
    pushTask('antes', 'Testar gravadores de áudio, lapela, gimbal e baterias de vídeo');
  }

  if (ctx.profile === 'casamento' || ctx.profile === '15_anos' || ctx.profile === 'formatura') {
    pushTask('antes', 'Alinhar horários e protocolo com cerimonialista/assessoria');
  }

  if (ctx.profile === 'ensaio') {
    pushTask('antes', 'Confirmar locação, horário da luz, trocas de look e restrições de ângulo');
  } else if (ctx.hasEnsaio) {
    pushTask('antes', `Alinhar data, locação e briefing do ${ctx.sessionLabel}`);
  }

  if (combined.includes('quadro')) {
    pushTask('antes', 'Conferir impressão/moldura do Quadro de Recepção');
  }

  // NO EVENTO (DURANTE)
  if (ctx.hasMakingOf) {
    pushTask('durante', 'Chegada no Making Of e fotos de detalhes (roupa, acessórios, preparo)');
  } else {
    pushTask('durante', 'Chegada da equipe no local com antecedência para ambientação');
  }

  switch (ctx.profile) {
    case 'casamento':
      pushTask('durante', 'Registro da cerimônia, cortejo, troca de alianças e fotos protocolares');
      pushTask('durante', 'Cobertura da recepção, brinde, corte do bolo e pista de dança');
      break;
    case '15_anos':
      pushTask('durante', 'Retratos da debutante, decoração e recepção dos convidados');
      pushTask('durante', 'Registro do cerimonial, valsa, homenagens e balada');
      break;
    case 'aniversario':
      pushTask('durante', 'Fotos da decoração, mesa do bolo e recepção dos convidados');
      pushTask('durante', 'Momentos espontâneos, hora do parabéns e fotos em grupo');
      break;
    case 'ensaio':
      pushTask('durante', 'Direção das poses, trocas de roupa e retratos respeitando preferências');
      break;
    case 'formatura':
      pushTask('durante', 'Colação / entrada oficial e fotos com familiares e turma');
      pushTask('durante', 'Cobertura da recepção, valsa e baile');
      break;
    case 'corporativo':
      pushTask('durante', 'Registro de estrutura/marca, palestrantes e momentos de networking');
      break;
    case 'esportivo':
      pushTask('durante', 'Aquecimento, momentos decisivos em ação e entrega de premiação');
      break;
    default:
      pushTask('durante', 'Registro dos momentos principais e fotos com convidados');
      break;
  }

  if (ctx.hasVideo) {
    pushTask(
      'durante',
      ctx.profile === 'casamento'
        ? 'Captar áudio limpo dos votos/discursos e depoimentos para o filme'
        : 'Captar takes cinematográficos, áudio ambiente e depoimentos'
    );
  }

  if (combined.includes('story')) {
    pushTask('durante', 'Gravar e entregar conteúdos em tempo real (Story Maker)');
  }

  pushTask('durante', 'Backup inicial de segurança dos cartões após o evento');

  // PÓS-EVENTO
  pushTask('pos', 'Descarregar mídias com backup duplo de segurança');
  pushTask('pos', 'Curadoria e seleção das melhores fotos');
  pushTask('pos', 'Edição de cor editorial e publicação da galeria online');

  if (ctx.hasVideo) {
    pushTask('pos', 'Seleção de takes, trilha sonora e edição/colorização do vídeo');
  }

  if (ctx.hasEnsaio && ctx.profile !== 'ensaio') {
    pushTask('pos', `Editar e entregar seleção de fotos do ${ctx.sessionLabel}`);
  }

  return tasks;
}

/**
 * Gera sugestão de cronograma inicial adaptado ao tipo de evento e pacote.
 */
export function buildDefaultTimelineForEvent(
  event: EventItem,
  packages: Package[] = []
): TimelineMoment[] {
  const ctx = buildBriefingContext(event, packages);
  const baseTime = event.time || '16:00';
  const loc = event.location || 'Local do evento';
  const stamp = Date.now();
  const moments: TimelineMoment[] = [];
  let seq = 1;

  const pushMoment = (
    time: string,
    title: string,
    location: string,
    description: string,
    responsible = 'Equipe G&C Studio'
  ) => {
    moments.push({
      id: `tml-${stamp}-${seq}`,
      event_id: event.id,
      time,
      title,
      location,
      description,
      responsible,
      sort_order: seq++,
    });
  };

  if (ctx.profile === 'casamento') {
    if (ctx.hasMakingOf) {
      pushMoment(
        shiftTime(baseTime, -150),
        'Making Of',
        'Local do Making Of (confirmar no briefing)',
        'Fotos de vestido, detalhes, maquiagem e momento com pais/madrinhas.'
      );
    }
    pushMoment(
      shiftTime(baseTime, -40),
      'Chegada no local da cerimônia',
      loc,
      'Registro da decoração vazia, montagem de áudio/iluminação e chegada dos convidados.'
    );
    pushMoment(
      baseTime,
      'Cerimônia Oficial',
      loc,
      ctx.hasVideo
        ? 'Cortejo de entradas, votos, troca de alianças e saída com captação de foto e áudio/vídeo.'
        : 'Cortejo de entradas, votos, troca de alianças e saída dos noivos.'
    );
    pushMoment(
      shiftTime(baseTime, 50),
      'Fotos Protocolares & Retratos do Casal',
      loc,
      'Fotos oficiais com pais e padrinhos + mini ensaio dos recém-casados.'
    );
    pushMoment(
      shiftTime(baseTime, 85),
      'Recepção & Abertura da Festa',
      loc,
      'Entrada na recepção, brinde, corte do bolo e pista de dança.'
    );
    pushMoment(
      shiftTime(baseTime, 210),
      'Encerramento da Cobertura',
      loc,
      'Últimos registros da pista e backup inicial de segurança.'
    );
    return moments;
  }

  if (ctx.profile === '15_anos') {
    if (ctx.hasMakingOf) {
      pushMoment(
        shiftTime(baseTime, -120),
        'Making Of da Debutante',
        'Local do Making Of (confirmar no briefing)',
        'Detalhes do vestido, coroa/sapato, preparo e retratos antes da festa.'
      );
    }
    pushMoment(
      shiftTime(baseTime, -30),
      'Chegada da Equipe & Decoração',
      loc,
      'Fotos da decoração, mesa do bolo e painel antes da chegada dos convidados.'
    );
    pushMoment(
      baseTime,
      'Recepção & Fotos na Entrada',
      loc,
      'Recepção de familiares e amigos + retratos com os convidados.'
    );
    pushMoment(
      shiftTime(baseTime, 90),
      'Cerimonial & Troca de Look',
      loc,
      'Entrada da corte/15 casais, troca de sapato/coroa e homenagens.'
    );
    pushMoment(
      shiftTime(baseTime, 120),
      'Valsa Oficial & Parabéns',
      loc,
      ctx.hasVideo
        ? 'Valsa com pai/familiares, corte do bolo e captação de áudio/vídeo.'
        : 'Valsa com pai/familiares, corte do bolo e foto oficial com todos.'
    );
    pushMoment(
      shiftTime(baseTime, 165),
      'Abertura da Pista & Balada',
      loc,
      'Dança animada, atrações da pista e cobertura espontânea.'
    );
    pushMoment(
      shiftTime(baseTime, 300),
      'Encerramento da Cobertura (5h)',
      loc,
      'Últimos registros da pista e conferência de mídias.'
    );
    return moments;
  }

  if (ctx.profile === 'aniversario') {
    if (ctx.hasMakingOf) {
      pushMoment(
        shiftTime(baseTime, -90),
        'Making Of & Preparo',
        'Local do Making Of',
        'Registros dos preparativos e detalhes do look.'
      );
    }
    pushMoment(
      shiftTime(baseTime, -20),
      'Chegada & Fotos da Decoração',
      loc,
      'Mesa do bolo, lembrancinhas e ambientação antes dos convidados chegarem.'
    );
    pushMoment(
      baseTime,
      'Início da Festa & Recepção',
      loc,
      'Fotos espontâneas com familiares e amigos chegando.'
    );
    pushMoment(
      shiftTime(baseTime, 90),
      'Parabéns & Fotos com a Família',
      loc,
      'Hora do parabéns na mesa do bolo, homenagens e fotos em grupo.'
    );
    pushMoment(
      shiftTime(baseTime, 180),
      'Encerramento da Cobertura',
      loc,
      'Registros finais e backup de segurança.'
    );
    return moments;
  }

  if (ctx.profile === 'ensaio') {
    pushMoment(
      shiftTime(baseTime, -15),
      'Encontro & Alinhamento de Looks',
      loc,
      'Reconhecimento da luz na locação e preparação inicial.'
    );
    pushMoment(
      baseTime,
      'Bloco 1 — Look Inicial',
      loc,
      'Poses leves de aquecimento respeitando preferências de ângulo do briefing.'
    );
    pushMoment(
      shiftTime(baseTime, 45),
      'Troca de Look (se houver) & Bloco 2',
      loc,
      'Variação de cenário, poses espontâneas em movimento e retratos próximos.'
    );
    pushMoment(
      shiftTime(baseTime, 100),
      'Encerramento do Ensaio',
      loc,
      'Últimos cliques aproveitando a melhor luz natural.'
    );
    return moments;
  }

  if (ctx.profile === 'formatura') {
    pushMoment(
      shiftTime(baseTime, -30),
      'Chegada & Retratos com a Família',
      loc,
      'Fotos posadas antes do início oficial da solenidade.'
    );
    pushMoment(
      baseTime,
      'Cerimônia / Colação Oficial',
      loc,
      'Entradas, entrega de canudo e homenagens.'
    );
    pushMoment(
      shiftTime(baseTime, 120),
      'Recepção, Valsa & Baile',
      loc,
      'Brinde, fotos com a turma e pista de dança.'
    );
    return moments;
  }

  if (ctx.profile === 'corporativo') {
    pushMoment(
      shiftTime(baseTime, -30),
      'Chegada, Branding & Ambiente',
      loc,
      'Fotos de palco, identidade visual, estandes e equipe.'
    );
    pushMoment(
      baseTime,
      'Abertura & Palestras / Conteúdo',
      loc,
      'Registros dos palestrantes, plateia e reações.'
    );
    pushMoment(
      shiftTime(baseTime, 120),
      'Networking & Encerramento',
      loc,
      'Interação entre participantes e foto oficial da equipe.'
    );
    return moments;
  }

  if (ctx.profile === 'esportivo') {
    pushMoment(
      shiftTime(baseTime, -30),
      'Chegada & Aquecimento',
      loc,
      'Reconhecimento dos melhores pontos de luz/ação e retratos pré-prova.'
    );
    pushMoment(
      baseTime,
      'Início da Competição / Prova',
      loc,
      'Cobertura em ação durante o percurso/disputa.'
    );
    pushMoment(
      shiftTime(baseTime, 120),
      'Chegada & Pódio / Premiação',
      loc,
      'Registros de pódio, medalhas e celebração.'
    );
    return moments;
  }

  pushMoment(
    shiftTime(baseTime, -30),
    'Chegada da Equipe & Ambientação',
    loc,
    'Ajuste de equipamento e registros iniciais do espaço.'
  );
  pushMoment(
    baseTime,
    'Início da Cobertura',
    loc,
    'Registro principal do evento conforme alinhamento prévio.'
  );
  pushMoment(
    shiftTime(baseTime, 120),
    'Momento Principal & Encerramento',
    loc,
    'Registros finais com convidados e backup de segurança.'
  );
  return moments;
}

/**
 * Cria estrutura inicial de briefing coerente com tipo de evento e pacote.
 */
export function buildInitialBriefingForEvent(
  event: EventItem,
  packages: Package[] = []
): BriefingData {
  const ctx = buildBriefingContext(event, packages);
  const nowIso = new Date().toISOString();

  return {
    id: 'brf-' + Date.now(),
    event_id: event.id,
    client_id: event.client_id,
    token: 'brf-' + Math.random().toString(36).substring(2, 10),
    status: 'nao_enviado',
    current_step: 1,
    event_info: {
      date: event.date,
      ceremony_time: event.time,
      reception_time: event.time || '19:00',
      ceremony_location: event.location,
      reception_location: event.location,
      making_of_address: '',
      team_arrival_time: shiftTime(event.time, -60),
      expected_end_time: '02:00',
    },
    ceremony_info: {
      type:
        event.type === '15 anos'
          ? 'Cerimonial de 15 Anos'
          : event.type === 'Formatura'
            ? 'Colação / Baile'
            : ctx.hasCeremony
              ? 'Cerimônia'
              : '',
      celebrant: '',
      parents_entrance: ctx.hasCeremony,
      godparents_entrance: ctx.profile === 'casamento',
      pages_flower_girls: ctx.profile === 'casamento',
      special_entrances: '',
      notes: '',
    },
    people: [],
    required_photos: ctx.defaultRequiredPhotos.map((rp, idx) => ({
      id: `rp-${Date.now()}-${idx}`,
      description: rp.description,
      people_involved: rp.people_involved,
    })),
    special_moments: {
      has_surprise: false,
      surprise_details: '',
      has_tribute: false,
      tribute_details: '',
      has_speech: false,
      speech_details: '',
      has_special_dance: false,
      special_dance_details: '',
      attention_moments: '',
    },
    party_info: {
      attractions: '',
      retrospective: false,
      games: '',
      surprise: '',
      no_photo_moments: '',
    },
    preferences: {
      photography_favorites: '',
      style: 'misto',
      references: '',
      dislikes: '',
      notes: '',
    },
    video_info: {
      important_music: '',
      essential_speeches: '',
      talking_people: '',
      essential_film_moments: '',
      record_testimonials: true,
    },
    session_info: {
      has_outfit_changes: false,
      outfit_changes_details: '',
      body_insecurities: '',
      preferred_poses: '',
      avoid_poses: '',
      props_or_elements: '',
      session_vibe: '',
      notes: '',
    },
    created_at: nowIso,
    updated_at: nowIso,
  };
}
