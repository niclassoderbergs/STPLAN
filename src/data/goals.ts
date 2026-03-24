export interface Activity {
  id: string;
  text: string;
  completed: boolean;
  isCustom?: boolean;
}

export type GoalStatus = 'planerad' | 'pågående' | 'utförd';
export type Category = 'A' | 'B' | 'C' | 'ALL';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const DUMMY_USERS: User[] = [
  { id: 'user-1', name: 'Dr. Erik Svensson', email: 'erik@exempel.se' },
  { id: 'user-2', name: 'Dr. Maria Lindberg', email: 'maria@exempel.se' }
];

export interface Goal {
  id: string;
  title: string;
  description: string;
  interpretation: string;
  howToAchieve: string;
  activities: Activity[];
  status: GoalStatus;
  category: 'A' | 'B' | 'C';
}

export const GOALS_DATA: Goal[] = [
  {
    id: 'a1',
    category: 'A',
    title: 'Medarbetarskap och ledarskap',
    description: 'Den specialistkompetenta läkaren ska kunna ta ansvar för det kontinuerliga lärandet på arbetsplatsen, utöva ledarskap i det dagliga arbetet, leda ett vårdteam, och ta ansvar för utvecklingen av det multiprofessionella samarbetet.',
    interpretation: 'ST-läkaren ska tillämpa en realistisk bedömning av den egna kompetensnivån, identifiera egna behov av kompetensutveckling och lära av egna och andras misstag.',
    howToAchieve: 'Klinisk tjänstgöring på vårdcentral under handledning intygas. Lämpliga metoder: sit-in, MSF, mini-CEX, ST-kollegium.',
    status: 'planerad',
    activities: [
      { id: 'a1-1', text: 'Delta i och leda teamarbete omkring enskilda patienter', completed: false },
      { id: 'a1-2', text: 'Handleda och utbilda övrig personal (t.ex. AT-läkare)', completed: false },
      { id: 'a1-3', text: 'Hålla i patientutbildningar', completed: false },
      { id: 'a1-4', text: 'Hantera praktiska ledningsuppgifter', completed: false },
      { id: 'a1-5', text: 'Ansvar för och dokumentation av sin egen utbildning', completed: false }
    ]
  },
  {
    id: 'a2',
    category: 'A',
    title: 'Etik, mångfald och jämlikhet',
    description: 'Uppvisa kunskap om medicinsketiska principer, identifiera etiska problem, hantera värdekonflikter och bemöta människor med respekt oberoende av bakgrund.',
    interpretation: 'ST-läkaren ska kunna bemöta människor med respekt oberoende av bakgrund och identifiera och hantera etiska dilemman i den kliniska vardagen.',
    howToAchieve: 'Klinisk tjänstgöring, kursintyg för kommunikation och etik, deltagande i FQ- och Balintgrupper.',
    status: 'planerad',
    activities: [
      { id: 'a2-1', text: 'Adekvat värdegrund i bemötandet och journalskrivningen', completed: false },
      { id: 'a2-2', text: 'Genomförande av tolksamtal', completed: false },
      { id: 'a2-3', text: 'Identifiera etiska problemställningar i patientmötet', completed: false }
    ]
  },
  {
    id: 'a3',
    category: 'A',
    title: 'Vårdhygien och smittskydd',
    description: 'Kunna ta ett ansvar för att vårdrelaterade infektioner och smittspridning förebyggs.',
    interpretation: 'ST-läkaren förväntas förstå, följa och ta ansvar för att hygien- och smittskyddsföreskrifter tillämpas i den kliniska vardagen.',
    howToAchieve: 'Hygienföreskrifter som tema för diskussion vid handledning. Utvärderas genom DOPS, sit-in och MSF.',
    status: 'planerad',
    activities: [
      { id: 'a3-1', text: 'Integrering av vårdhygien (handhygien, klädsel) i arbetet', completed: false },
      { id: 'a3-2', text: 'Deltagande vid årlig hygienrond', completed: false },
      { id: 'a3-3', text: 'Behärska anmälningar enligt smittskyddslagen', completed: false },
      { id: 'a3-4', text: 'Kännedom om vaccinationers roll vid smittskydd', completed: false }
    ]
  },
  {
    id: 'a4',
    category: 'A',
    title: 'Systematiskt kvalitets- och patientsäkerhetsarbete',
    description: 'Kritiskt granska verksamheten, genomföra risk- och händelseanalys, och ta ansvar för förbättrande åtgärder.',
    interpretation: 'ST-läkaren ska kunna reflektera kring risker i egna patientfall, hantering av verksamhetens brister och avvikelsehantering.',
    howToAchieve: 'Godkännande av kvalitets- och utvecklingsarbete (muntligt och skriftligt). Deltagande vid personalmöten och seminarier.',
    status: 'planerad',
    activities: [
      { id: 'a4-1', text: 'Deltagande vid ledningsgruppsmöte', completed: false },
      { id: 'a4-2', text: 'Avvikelserapportering', completed: false },
      { id: 'a4-3', text: 'Löpande förslag om förbättringar i vardagen', completed: false }
    ]
  },
  {
    id: 'a5',
    category: 'A',
    title: 'Medicinsk vetenskap',
    description: 'Fördjupade kunskaper om vetenskapliga metoder, kritiskt granska information och uppvisa ett vetenskapligt förhållningssätt.',
    interpretation: 'ST-läkaren ska kunna väga samman evidens med egen erfarenhet och kritiskt granska vetenskapliga texter.',
    howToAchieve: 'Kurs i forskningsmetodik, självständigt skriftligt arbete (5-10 veckor), presentation.',
    status: 'planerad',
    activities: [
      { id: 'a5-1', text: 'Sammanvägning av evidens med egen erfarenhet', completed: false },
      { id: 'a5-2', text: 'Redogöra för kanaler för att söka ny kunskap', completed: false },
      { id: 'a5-3', text: 'Genomfört och presenterat vetenskapligt arbete', completed: false }
    ]
  },
  {
    id: 'a6',
    category: 'A',
    title: 'Lagar och organisation',
    description: 'Kunskap om lagar och föreskrifter inom hälso- och sjukvården, organisation, administration och ekonomiska styrsystem.',
    interpretation: 'ST-läkaren ska ha kunskap till sjukvårdens lagar och regelverk och hur organisationen fungerar.',
    howToAchieve: 'Godkänt kursintyg (t.ex. organisationskunskap på kompetensportalen).',
    status: 'planerad',
    activities: [
      { id: 'a6-1', text: 'Godkänd kurs i lagar och organisation', completed: false }
    ]
  },
  {
    id: 'b1',
    category: 'B',
    title: 'Kommunikation med patienter',
    description: 'Anpassa kommunikation efter individuella behov, ge svåra besked med empati och samråda om egenvård.',
    interpretation: 'ST-läkaren ska visa förståelse för språkliga, kulturella och intellektuella skillnader i sjukdomsuppfattning.',
    howToAchieve: 'Medsittningar, videoinspelningar, kurs i samtalsmetodik (MI), Balintgrupp.',
    status: 'planerad',
    activities: [
      { id: 'b1-1', text: 'Patientcentrerat arbete med föreställningar/förväntningar/farhågor', completed: false },
      { id: 'b1-2', text: 'Kommunikation vid ej medicinskt motiverade utredningar', completed: false },
      { id: 'b1-3', text: 'Integration av vetenskap i patientkommunikation', completed: false },
      { id: 'b1-4', text: 'Genomfört tolksamtal', completed: false }
    ]
  },
  {
    id: 'b2',
    category: 'B',
    title: 'Sjukdomsförebyggande arbete',
    description: 'Vägleda patienter om levnadsvanor för att förebygga sjukdom och förbättra prognos.',
    interpretation: 'ST-läkaren ska framvisa förståelse för hälsoekonomiska aspekter och behovet av preventiva insatser.',
    howToAchieve: 'Klinisk tjänstgöring, kurs om riskfaktorer och MI, självstudier av nationella riktlinjer.',
    status: 'planerad',
    activities: [
      { id: 'b2-1', text: 'Vägledning kring rökning/alkohol/kost/motion', completed: false },
      { id: 'b2-2', text: 'Tillämpning av hälsoekonomiska aspekter i vardagen', completed: false }
    ]
  },
  {
    id: 'b3',
    category: 'B',
    title: 'Läkemedel',
    description: 'Anpassa behandling efter ålder, kön, organfunktion och samsjuklighet. Bedöma risker för biverkningar.',
    interpretation: 'ST-läkaren ska framvisa förståelse för valet av att använda eller inte använda läkemedel.',
    howToAchieve: 'Läkemedelsgenomgångar, medsittning, obligatorisk kurs i läkemedelsbehandling.',
    status: 'planerad',
    activities: [
      { id: 'b3-1', text: 'Deltagande i systematiska läkemedelsgenomgångar', completed: false },
      { id: 'b3-2', text: 'Hantering av polyfarmaci hos äldre', completed: false },
      { id: 'b3-3', text: 'Antibiotikabehandling enligt STRAMA', completed: false },
      { id: 'b3-4', text: 'Hantering av beroendeframkallande läkemedel', completed: false }
    ]
  },
  {
    id: 'b4',
    category: 'B',
    title: 'Försäkringsmedicin',
    description: 'Tillämpa metoder inom försäkringsmedicin och samverka med andra aktörer.',
    interpretation: 'Förståelse av hur försäkringsmedicin är ett verktyg i behandlingen av vissa tillstånd.',
    howToAchieve: 'Samrådsmöten med Försäkringskassan, obligatorisk kurs i försäkringsmedicin.',
    status: 'planerad',
    activities: [
      { id: 'b4-1', text: 'Medsittning vid avstämningsmöten med FK', completed: false },
      { id: 'b4-2', text: 'Bedömning av komplexa sjukskrivningsärenden', completed: false },
      { id: 'b4-3', text: 'Samarbete med rehab-team', completed: false }
    ]
  },
  {
    id: 'b5',
    category: 'B',
    title: 'Palliativ vård',
    description: 'Identifiera behov av palliativ vård, genomföra brytpunktssamtal och tillämpa symtomlindring.',
    interpretation: 'ST-läkaren ska känna sig trygg i att hantera patienter och anhöriga i livets slutskede.',
    howToAchieve: 'Tjänstgöring/auskultation vid palliativ enhet, obligatorisk kurs, brytpunktssamtal.',
    status: 'planerad',
    activities: [
      { id: 'b5-1', text: 'Genomfört brytpunktssamtal', completed: false },
      { id: 'b5-2', text: 'Hantering av smärta och ångest i slutskedet', completed: false },
      { id: 'b5-3', text: 'Samarbete med LAH/hemsjukvård', completed: false }
    ]
  },
  {
    id: 'c1',
    category: 'C',
    title: 'Bedöma och handlägga hälsoproblem',
    description: 'Behärska att bedöma och handlägga i landet förekommande hälsoproblem etiskt och medicinskt.',
    interpretation: 'Självständigt kunna bedöma alla olika hälsoproblem, skilja friskt från sjukt och veta när remittering krävs.',
    howToAchieve: 'Lång klinisk tjänstgöring, bredd i patientklientel, journalgranskning.',
    status: 'planerad',
    activities: [
      { id: 'c1-1', text: 'Använda anamnes och status som diagnostiska redskap', completed: false },
      { id: 'c1-2', text: 'Hantera läkarrollen i teamarbetet på VC', completed: false },
      { id: 'c1-3', text: 'Förmedla egenvårdsråd effektivt', completed: false }
    ]
  },
  {
    id: 'c2',
    category: 'C',
    title: 'Prioritera',
    description: 'Avgöra medicinsk angelägenhetsgrad och prioritera mellan vårdsökande.',
    interpretation: 'Att kunna avgöra medicinsk angelägenhetsgrad på ett etiskt försvarbart sätt.',
    howToAchieve: 'Tjänstgöring på akutmottagning och kväll/helgmottagning, arbete med AKO.',
    status: 'planerad',
    activities: [
      { id: 'c2-1', text: 'Medicinsk, etisk och resursmässig prioritering', completed: false },
      { id: 'c2-2', text: 'Triagering (t.ex. telefontriagering)', completed: false },
      { id: 'c2-3', text: 'Hantering av "pappershögen" och remissvar', completed: false }
    ]
  },
  {
    id: 'c3',
    category: 'C',
    title: 'Följa hälsotillstånd över tid',
    description: 'Följa och värdera förändringar i hälsotillstånd över längre tid med hänsyn till livssituation.',
    interpretation: 'ST-läkaren ska kunna följa en patient genom livets alla skiftningar (PAL-ansvar).',
    howToAchieve: 'Längre sammanhängande tjänstgöring (minst 1 år) på samma VC, kurs i allmänmedicinskt arbetssätt.',
    status: 'planerad',
    activities: [
      { id: 'c3-1', text: 'Aktivt kontinuitetstänk i bokningen', completed: false },
      { id: 'c3-2', text: 'Vården av egen lista och kroniker', completed: false },
      { id: 'c3-3', text: 'Ansvar för särskilt boende', completed: false }
    ]
  },
  {
    id: 'c4',
    category: 'C',
    title: 'Diagnosticera och behandla alla åldrar',
    description: 'Behärska diagnostik och behandling av vanliga folksjukdomar i alla åldrar, inkl. missbruk.',
    interpretation: 'Gripa över diagnostik, behandling, uppföljning och prevention av vanliga sjukdomar.',
    howToAchieve: 'Klinisk tjänstgöring på VC och sidotjänstgöring (t.ex. psykiatri), FQ-grupp.',
    status: 'planerad',
    activities: [
      { id: 'c4-1', text: 'Handläggning av personer med missbruk', completed: false },
      { id: 'c4-2', text: 'Arbete på BHV och särskilda boenden', completed: false },
      { id: 'c4-3', text: 'Teamarbete kring astma/KOL, diabetes, demens', completed: false }
    ]
  },
  {
    id: 'c6',
    category: 'C',
    title: 'Barn och ungdomar',
    description: 'Behärska hälso- och sjukvårdsarbete för barn och ungdomar, identifiera barn som far illa.',
    interpretation: 'ST-läkaren ska behärska hälso- och sjukvårdsarbete för barn och ungdomar.',
    howToAchieve: 'Tjänstgöring på VC (BHV) och barnklinik, kurs i Barnhälsovård.',
    status: 'planerad',
    activities: [
      { id: 'c6-1', text: 'Självständig BHV under handledning', completed: false },
      { id: 'c6-2', text: 'Kunskap om orosanmälan enligt socialtjänstlagen', completed: false },
      { id: 'c6-3', text: 'Auskultation vid skolhälsovård/ungdomsmottagning', completed: false }
    ]
  },
  {
    id: 'c7',
    category: 'C',
    title: 'Gynekologiska sjukdomar',
    description: 'Handläggning av gynekologiska besvär och mödrahälsovård vid normala graviditeter.',
    interpretation: 'ST-läkaren ska behärska vanliga gynekologiska besvär och mödrahälsovård.',
    howToAchieve: 'Tjänstgöring på VC och gynekologisk klinik, mini-CEX för undersökningsmetodik.',
    status: 'planerad',
    activities: [
      { id: 'c7-1', text: 'Gynekologisk undersökningsteknik', completed: false },
      { id: 'c7-2', text: 'Handläggning av STI och preventivmedel', completed: false },
      { id: 'c7-3', text: 'Mödrahälsovård vid normal graviditet', completed: false }
    ]
  },
  {
    id: 'c13',
    category: 'C',
    title: 'Psykiska sjukdomar',
    description: 'Behärska handläggning av vanliga och viktiga psykiska sjukdomar.',
    interpretation: 'Veta när patienten behöver hjälp av specialistpsykiatrin vs primärvårdens uppdrag.',
    howToAchieve: 'Tjänstgöring på VC och inom psykiatri, journalgenomgångar.',
    status: 'planerad',
    activities: [
      { id: 'c13-1', text: 'Baskunskap i psykiatri och gränssnitt mot specialistvård', completed: false },
      { id: 'c13-2', text: 'Initial handläggning av barn med psykiska störningar', completed: false },
      { id: 'c13-3', text: 'Kunskap om samsjuklighet psykiatri/beroende', completed: false }
    ]
  }
];
