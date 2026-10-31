// Comprehensive Granular Anatomical & USMLE Step 1 Dataset for the Middle Ear 3D Diorama
// Separates every ossicle sub-region, joint, ligament, muscle belly vs. tendon, eardrum zone,
// medial/posterior micro-landmark, cranial nerve branch, and inner/outer ear organ (60 distinct 3D structures).

export const CATEGORIES = {
  WALLS: 'Walls, Compartments & Eardrum Regions',
  MEDIAL: 'Medial Wall Landmarks',
  OPENINGS: 'Anterior & Posterior Features',
  OSSICLES: 'Auditory Ossicles, Joints & Ligaments',
  NEUROMUSCULAR: 'Muscles, Tendons & Nerves',
  NEIGHBORS: 'Inner Ear, Outer Ear & Vascular Neighbors'
};

export const ANATOMY_DATA = {
  // =========================================================================
  // 1. THE 6 WALLS, COMPARTMENTS & TYMPANIC MEMBRANE SUB-REGIONS (12)
  // =========================================================================
  tegmen_tympani: {
    id: 'tegmen_tympani',
    name: 'Roof — Tegmental Wall (Tegmen Tympani)',
    shortName: 'Roof (Tegmen Tympani)',
    aka: 'Paries Tegmentalis',
    category: CATEGORIES.WALLS,
    wall: 'Roof (Superior)',
    tier: 1,
    aliases: ['tegmen tympani', 'tegmental wall', 'roof of middle ear', 'paries tegmentalis', 'tegmen', 'roof'],
    boxColor: 0x84cc16,
    tissueColor: 0xd9cdb8,
    summary:
      'A thin laminar plate of the petrous part of the temporal bone forming the ceiling of the tympanic cavity (epitympanic recess), the tensor tympani canal, and the mastoid antrum.',
    relations:
      'Separates the middle ear cavity inferiorly from the dura mater on the floor of the Middle Cranial Fossa and the Temporal Lobe superiorly.',
    supply:
      'Pierced by the lesser petrosal nerve (from tympanic plexus). Petrosquamous suture may remain unossified in children.',
    clinicalPearl:
      'Because the tegmen tympani is paper-thin, untreated acute otitis media or mastoiditis can erode upward through the roof, causing extradural abscess, meningitis, or temporal lobe brain abscess.',
    quizClue:
      'Thin laminar plate of petrous temporal bone separating the middle ear cavity from the dura mater of the middle cranial fossa.',
    quizHint: 'Look straight UP (+Y) at the ceiling of the middle ear room.'
  },

  jugular_wall: {
    id: 'jugular_wall',
    name: 'Floor — Jugular Wall (Hypotympanic Floor)',
    shortName: 'Floor (Jugular Wall)',
    aka: 'Paries Jugularis / Hypotympanum',
    category: CATEGORIES.WALLS,
    wall: 'Floor (Inferior)',
    tier: 1,
    aliases: ['jugular wall', 'floor of middle ear', 'paries jugularis', 'hypotympanic floor', 'hypotympanum', 'floor'],
    boxColor: 0x10b981,
    tissueColor: 0xcfc2ac,
    summary:
      'A narrow, thin plate of temporal bone forming the floor (hypotympanum) of the middle ear room.',
    relations:
      'Separates the tympanic cavity superiorly from the Superior Bulb of the Internal Jugular Vein directly beneath it.',
    supply:
      'Perforated near its medial border by the small Tympanic Canaliculus, transmitting Jacobson’s nerve (CN IX) onto the promontory.',
    clinicalPearl:
      'A glomus jugulare tumor (paraganglioma arising near the jugular bulb) can erode upward through this thin floor, appearing on otoscopy as a pulsatile reddish-blue mass behind the lower tympanic membrane.',
    quizClue:
      'Thin bony boundary separating the middle ear cavity from the superior bulb of the internal jugular vein and pierced by Jacobson’s nerve (CN IX).',
    quizHint: 'Look straight DOWN (-Y) at the floor of the room.'
  },

  lateral_wall_scutum: {
    id: 'lateral_wall_scutum',
    name: 'Scutum (Lateral Bony Attic Wall)',
    shortName: 'Scutum (Lateral Attic Wall)',
    aka: 'Paries Membranaceus (Superior Bony Wedge)',
    category: CATEGORIES.WALLS,
    wall: 'Lateral (Superior)',
    tier: 2,
    aliases: ['scutum', 'lateral attic wall', 'epitympanic bony wall', 'bony lateral wall'],
    boxColor: 0x38bdf8,
    tissueColor: 0xd6c8b2,
    summary:
      'Sharp wedge-like bony upper portion of the lateral wall formed by the squamous temporal bone, enclosing the lateral aspect of the epitympanic recess above the eardrum.',
    relations:
      'Lies immediately superior to Pars Flaccida (Notch of Rivinus) and lateral to the head/neck of the malleus and body of the incus (bounding Prussak’s space laterally).',
    supply: 'Squamous part of temporal bone.',
    clinicalPearl:
      'Blunting or erosion of the sharp bony scutum on a coronal CT scan of the temporal bone is a classic radiological hallmark of an acquired pars-flaccida cholesteatoma.',
    quizClue:
      'Sharp bony wedge of squamous temporal bone forming the upper lateral wall of the epitympanic recess above pars flaccida, classically eroded on CT by cholesteatoma.',
    quizHint: 'Look at the upper bony part of the Lateral Wall directly above the eardrum.'
  },

  tm_pars_tensa: {
    id: 'tm_pars_tensa',
    name: 'Pars Tensa of Tympanic Membrane',
    shortName: 'Pars Tensa (Eardrum)',
    aka: 'Taut Trilaminar Vibrating Portion of Tympanic Membrane',
    category: CATEGORIES.WALLS,
    wall: 'Lateral',
    tier: 1,
    parentGroup: 'tympanic_membrane',
    parentName: 'Tympanic Membrane',
    aliases: ['pars tensa', 'pars tensa of tympanic membrane', 'taut part of tympanic membrane'],
    boxColor: 0x60a5fa,
    tissueColor: 0xe8d5b7,
    summary:
      'The large, taut main vibrating expanse of the Tympanic Membrane inferior to the anterior and posterior mallear folds. Possesses all three histological layers: outer ectodermal skin, middle fibrous lamina propria (outer radiating + inner circular collagen fibers), and inner endodermal mucosa.',
    relations:
      'Anchored peripherally into the horseshoe fibrocartilaginous Annulus Tympanicus; drawn medially at its center by the handle of the malleus.',
    supply:
      'Outer surface: Auriculotemporal (CN V3) & Auricular branch of Vagus (CN X). Inner mucosal surface: Glossopharyngeal (CN IX).',
    clinicalPearl:
      'Myringotomy (tympanostomy tube placement) is performed in the ANTEROINFERIOR or POSTEROINFERIOR quadrant of Pars Tensa — safely away from the ossicles and chorda tympani!',
    quizClue:
      'Large taut lower portion of the tympanic membrane containing radial and circular collagen fibers between ectodermal and endodermal layers.',
    quizHint: 'Look at the main translucent vibrant expanse of the conical Tympanic Membrane on the Lateral Wall.'
  },

  tm_pars_flaccida: {
    id: 'tm_pars_flaccida',
    name: 'Pars Flaccida (Shrapnell’s Membrane)',
    shortName: 'Pars Flaccida (Shrapnell’s)',
    aka: 'Membrana Flaccida / Shrapnell’s Membrane',
    category: CATEGORIES.WALLS,
    wall: 'Lateral (Superior Drum)',
    tier: 2,
    parentGroup: 'tympanic_membrane',
    parentName: 'Tympanic Membrane',
    aliases: [
      'pars flaccida',
      'shrapnell membrane',
      'shrapnells membrane',
      'membrane of shrapnell',
      'flaccid membrane',
      'membrana flaccida'
    ],
    boxColor: 0xf472b6,
    tissueColor: 0xf2c6c2,
    summary:
      'Small triangular lax superior patch of the Tympanic Membrane situated above the lateral process of the malleus between the anterior and posterior mallear folds, spanning the Notch of Rivinus.',
    relations:
      'Forms the lateral wall of Prussak’s space (lateral epitympanic recess) immediately lateral to the neck of the malleus and inferior to the bony Scutum.',
    supply:
      'Lacks the dense middle fibrous collagen layer of pars tensa, making it thin and compliant.',
    clinicalPearl:
      'Because Pars Flaccida lacks the tough fibrous lamina propria, chronic negative middle-ear pressure pulls it inward as a retraction pocket into Prussak’s space — the #1 origin site of acquired attic CHOLESTEATOMA!',
    quizClue:
      'Lax superior triangular portion of the tympanic membrane above the mallear folds that lacks a dense fibrous layer and is the primary site of retraction-pocket cholesteatomas.',
    quizHint: 'Look at the small triangular patch at the very TOP (12 o’clock) of the Tympanic Membrane above the lateral process of the malleus.'
  },

  tm_umbo: {
    id: 'tm_umbo',
    name: 'Umbo of Tympanic Membrane',
    shortName: 'Umbo (Apex of Drum Cone)',
    aka: 'Umbo Membranae Tympanicae',
    category: CATEGORIES.WALLS,
    wall: 'Lateral (Central Apex)',
    tier: 2,
    parentGroup: 'tympanic_membrane',
    parentName: 'Tympanic Membrane',
    aliases: ['umbo', 'umbo of tympanic membrane', 'umbo of eardrum'],
    boxColor: 0x38bdf8,
    tissueColor: 0xfef3c7,
    summary:
      'The most depressed central/slightly anteroinferior apex of the conical Tympanic Membrane (~110° opening angle), pulled medially into the tympanic cavity by the spatulate tip of the handle (manubrium) of the malleus.',
    relations:
      'Directly faces the cochlear Promontory across the narrowest point of the tympanic cavity (~2 mm gap!). The Cone of Light radiates anteroinferiorly from the umbo.',
    supply: 'Dense radial collagen fibers converge onto the perichondrium/periosteum of the malleus tip here.',
    clinicalPearl:
      'Because the umbo sits only ~2 mm lateral to the promontory, severe eardrum retraction (atelectasis) can adhere the umbo directly onto the promontory!',
    quizClue:
      'Most depressed central inward-pointing apex of the conical tympanic membrane where the spatulate tip of the malleus handle attaches.',
    quizHint: 'Look right at the central inward-pointing peak of the Tympanic Membrane where the tip of the malleus handle terminates.'
  },

  tm_cone_of_light: {
    id: 'tm_cone_of_light',
    name: 'Cone of Light (Anteroinferior Light Reflex)',
    shortName: 'Cone of Light',
    aka: 'Otoscopic Specular Light Reflex (5 o’clock Right / 7 o’clock Left)',
    category: CATEGORIES.WALLS,
    wall: 'Lateral (Anteroinferior Drum)',
    tier: 3,
    parentGroup: 'tympanic_membrane',
    parentName: 'Tympanic Membrane',
    aliases: ['cone of light', 'light reflex', 'tympanic light reflex', 'otoscopic cone of light'],
    boxColor: 0xfef08a,
    tissueColor: 0xfef9c3,
    summary:
      'Triangular wedge of reflected light seen in the anteroinferior quadrant of the Pars Tensa radiating from the Umbo toward the periphery (at 5 o’clock in a Right Ear, 7 o’clock in a Left Ear).',
    relations:
      'Created optically because the anteroinferior quadrant of the oblique, inward-coned tympanic membrane lies nearly perpendicular to the axis of the external auditory canal and otoscope beam.',
    supply: 'Optical landmark of healthy Pars Tensa curvature.',
    clinicalPearl:
      'Loss, fragmentation, or dulling of the Cone of Light on otoscopy indicates altered eardrum curvature from middle-ear effusion (acute otitis media) or severe retraction!',
    quizClue:
      'Triangular anteroinferior specular light reflex radiating from the umbo (at 5 o’clock on the right eardrum, 7 o’clock on the left) on otoscopy.',
    quizHint: 'Look at the bright anteroinferior triangular wedge radiating downward and forward from the Umbo on the Tympanic Membrane.'
  },

  annulus_tympanicus: {
    id: 'annulus_tympanicus',
    name: 'Annulus Tympanicus & Mallear Folds (with Notch of Rivinus)',
    shortName: 'Annulus Tympanicus & Mallear Folds',
    aka: 'Fibrocartilaginous Tympanic Ring & Anterior/Posterior Mallear Folds',
    category: CATEGORIES.WALLS,
    wall: 'Lateral (Drum Rim)',
    tier: 3,
    parentGroup: 'tympanic_membrane',
    parentName: 'Tympanic Membrane',
    aliases: [
      'annulus tympanicus',
      'tympanic annulus',
      'fibrocartilaginous ring',
      'fibrocartilaginous annulus',
      'mallear folds',
      'annulus'
    ],
    boxColor: 0xf8fafc,
    tissueColor: 0xf1f5f9,
    summary:
      'Thickened horseshoe-shaped fibrocartilaginous ring seating the periphery of Pars Tensa into the bony tympanic sulcus. It is deficient superiorly at the Notch of Rivinus, from whose ends the Anterior and Posterior Mallear Folds converge onto the lateral process of the malleus.',
    relations:
      'Separates Pars Tensa (enclosed by the annulus) from Pars Flaccida (spanning the superior Notch of Rivinus above the mallear folds).',
    supply: 'Tympanic ring of temporal bone.',
    clinicalPearl:
      'During tympanoplasty surgery, ENT surgeons elevate a "tympanomeatal flap" by lifting this tough white fibrocartilaginous annulus cleanly out of its bony sulcus without tearing the chorda tympani just medial to it!',
    quizClue:
      'Horseshoe-shaped fibrocartilaginous ring anchoring the periphery of pars tensa into the tympanic sulcus, deficient superiorly at the Notch of Rivinus.',
    quizHint: 'Look at the white horseshoe ring around the rim of the Tympanic Membrane and the two folds V-ing above the lateral process.'
  },

  medial_wall: {
    id: 'medial_wall',
    name: 'Medial Wall — Labyrinthine Wall',
    shortName: 'Medial (Labyrinthine) Wall',
    aka: 'Paries Labyrinthicus',
    category: CATEGORIES.WALLS,
    wall: 'Medial',
    tier: 1,
    aliases: ['medial wall', 'labyrinthine wall', 'paries labyrinthicus'],
    boxColor: 0xe11d48,
    tissueColor: 0xd4c3ad,
    summary:
      'Vertical bony partition forming the medial boundary of the middle ear, simultaneously serving as the lateral capsule wall of the Inner Ear (bony labyrinth).',
    relations:
      'Bears the Promontory centrally, Oval Window posterosuperiorly, Round Window & Niche posteroinferiorly, Ponticulus, Facial Nerve Canal prominence, Lateral Semicircular Canal prominence, and Processus Cochleariformis.',
    supply: 'Mucosal sensory supply via Tympanic Plexus (CN IX).',
    clinicalPearl:
      'Every contour on the labyrinthine wall mirrors an inner-ear or cranial-nerve structure pressed immediately behind it: basal turn of cochlea, vestibule, scala tympani, CN VII, and lateral semicircular canal.',
    quizClue:
      'Boundary wall separating the tympanic cavity from the inner ear, bearing the promontory, oval window, and round window.',
    quizHint: 'Face Medially (-Z) toward the rose-colored inner-ear wall opposite the eardrum.'
  },

  posterior_wall: {
    id: 'posterior_wall',
    name: 'Posterior Wall — Mastoid Wall',
    shortName: 'Posterior (Mastoid) Wall',
    aka: 'Paries Mastoideus',
    category: CATEGORIES.WALLS,
    wall: 'Posterior',
    tier: 1,
    aliases: ['posterior wall', 'mastoid wall', 'paries mastoideus'],
    boxColor: 0xeab308,
    tissueColor: 0xd2c4ae,
    summary:
      'Bony partition separating the tympanic cavity anteriorly from the mastoid antrum and mastoid air cells posteriorly.',
    relations:
      'Features the Aditus to Mastoid Antrum superiorly, Fossa Incudis just below the aditus, Pyramidal Eminence, Posterior Canaliculus for Chorda Tympani, and vertical mastoid segment of CN VII behind it.',
    supply: 'Stylomastoid arterial arcade & mucosal plexus.',
    clinicalPearl:
      'Surgeons access the middle ear for cochlear implantation via the "facial recess" triangle on the posterior wall: bounded medially by vertical CN VII, laterally by chorda tympani, and superiorly by fossa incudis!',
    quizClue:
      'Bony partition separating the tympanic cavity from the mastoid air cells, featuring the aditus superiorly and pyramidal eminence below.',
    quizHint: 'Look toward the golden Posterior Wall.'
  },

  anterior_wall: {
    id: 'anterior_wall',
    name: 'Anterior Wall — Carotid Wall',
    shortName: 'Anterior (Carotid) Wall',
    aka: 'Paries Caroticus',
    category: CATEGORIES.WALLS,
    wall: 'Anterior',
    tier: 1,
    aliases: ['anterior wall', 'carotid wall', 'paries caroticus'],
    boxColor: 0x3b82f6,
    tissueColor: 0xcfc1ab,
    summary:
      'Narrow anterior wall whose thin lower bony plate separates the middle ear from the Carotid Canal and whose upper part contains two parallel openings (Tensor Tympani semicanal above, Eustachian tube below).',
    relations:
      'Perforated inferiorly by caroticotympanic sympathetic nerves and tiny tympanic arterial twigs from the internal carotid artery.',
    supply: 'Caroticotympanic branches of Internal Carotid Artery.',
    clinicalPearl:
      'Dehiscence or thinning of the lower carotid wall can produce rhythmic pulsatile tinnitus synchronous with the heartbeat and poses catastrophic arterial bleeding risk if mistaken for an effusion.',
    quizClue:
      'Thin bony plate separating the tympanic cavity from the internal carotid artery, perforated superiorly by the tensor tympani canal and auditory tube.',
    quizHint: 'Look toward the blue Anterior Wall.'
  },

  epitympanic_recess: {
    id: 'epitympanic_recess',
    name: 'Epitympanic Recess (Attic)',
    shortName: 'Epitympanic Recess (Attic)',
    aka: 'Epitympanum',
    category: CATEGORIES.WALLS,
    wall: 'Superior Compartment',
    tier: 1,
    aliases: ['epitympanic recess', 'epitympanum', 'attic', 'tympanic attic'],
    boxColor: 0xa3e635,
    tissueColor: 0xc4b5fd,
    summary:
      'The superior "attic" compartment of the middle ear located above the superior margin of the tympanic membrane, directly beneath the Tegmen Tympani roof.',
    relations:
      'Lodges the Head of the Malleus, Incudomallear Joint, and Body + Short Limb of the Incus; communicates posteriorly with the Mastoid Antrum via the Aditus.',
    supply: 'Lined by mucoperiosteum innervated by CN IX.',
    clinicalPearl:
      'Mucosal folds around the malleus and incus partition ventilation pathways into the attic — blockage causes selective attic negative pressure and pars-flaccida retraction pockets.',
    quizClue:
      'Upper "attic" compartment of the middle ear above the level of the eardrum housing the head of the malleus and body of the incus.',
    quizHint: 'Look in the upper third of the room above the dashed attic cornice line.'
  },

  // =========================================================================
  // 2. MEDIAL WALL LANDMARKS & MICRO-CONTOURS (8)
  // =========================================================================
  promontory: {
    id: 'promontory',
    name: 'Cochlear Promontory',
    shortName: 'Promontory',
    aka: 'Promontorium Tympani (Basal Turn of Cochlea Bulge)',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial',
    tier: 1,
    aliases: ['promontory', 'cochlear promontory', 'promontorium'],
    boxColor: 0xf43f5e,
    tissueColor: 0xe5cfc0,
    summary:
      'Rounded central bony mound on the medial wall pushed laterally by the wide first (basal) turn of the Cochlea directly behind it.',
    relations:
      'Grooved vertically by fine sulci for the Tympanic Plexus (Jacobson’s nerve, CN IX). Oval window lies posterosuperior; round window niche lies posteroinferior.',
    supply: 'Overlain by Tympanic Plexus.',
    clinicalPearl:
      'Because the basal turn of the cochlea encodes HIGH-frequency sound, middle-ear inflammatory toxins diffusing across nearby windows damage high-frequency hearing first!',
    quizClue:
      'Rounded central bulge on the medial wall formed by the underlying basal turn of the cochlea and grooved by the tympanic plexus.',
    quizHint: 'Look at the large central dome bulging out of the Medial Wall.'
  },

  ponticulus: {
    id: 'ponticulus',
    name: 'Ponticulus (Medial-to-Posterior Bony Bridge)',
    shortName: 'Ponticulus',
    aka: 'Bony Ridge Bridging Promontory to Pyramidal Eminence',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial -> Posterior',
    tier: 3,
    aliases: ['ponticulus', 'ponticulus of middle ear', 'bony ponticulus'],
    boxColor: 0xfb7185,
    tissueColor: 0xe2cbb8,
    summary:
      'Slender horizontal bony ridge spanning across the posterior tympanic wall from the posterior slope of the Promontory to the Pyramidal Eminence.',
    relations:
      'Forms the superior boundary of the Sinus Tympani (deep retrotympanic recess medial to the pyramidal eminence and CN VII), separating the oval window niche above from the sinus tympani and round window niche below.',
    supply: 'Otic/petrous bony ridge.',
    clinicalPearl:
      'In cholesteatoma surgery, the Sinus Tympani just beneath the Ponticulus is notorious as the #1 "blind spot" where residual cholesteatoma matrix hides out of direct microscopic view!',
    quizClue:
      'Slender bony ridge bridging between the posterior promontory and the pyramidal eminence, bounding the sinus tympani superiorly between the two windows.',
    quizHint: 'Look between the posterior edge of the Promontory and the Pyramidal Eminence (between the Oval and Round windows).'
  },

  oval_window: {
    id: 'oval_window',
    name: 'Oval Window (Fenestra Vestibuli)',
    shortName: 'Oval Window',
    aka: 'Fenestra Vestibuli',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial (Posterosuperior)',
    tier: 1,
    aliases: ['oval window', 'fenestra vestibuli', 'vestibular window', 'fenestra ovalis'],
    boxColor: 0x38bdf8,
    tissueColor: 0x7dd3fc,
    summary:
      'Reniform (kidney-shaped) opening posterosuperior to the promontory leading directly into the Vestibule (and scala vestibuli) of the bony labyrinth.',
    relations:
      'Occupied by the Footplate of the Stapes anchored by the fibrous annular ligament; lies immediately inferior to the horizontal prominence of the Facial Nerve Canal (CN VII).',
    supply: 'Receives piston/rocking acoustic vibrations from stapes.',
    clinicalPearl:
      'In OTOSCLEROSIS, abnormal vascular spongy bone replaces endochondral otic-capsule bone around the anterior oval window (fissula ante fenestram), locking the stapes footplate immobile.',
    quizClue:
      'Kidney-shaped opening posterosuperior to the promontory on the medial wall leading into the inner-ear vestibule and occupied by the stapes footplate.',
    quizHint: 'Look on the Medial Wall posterosuperior to the promontory where the stapes footplate lands.'
  },

  round_window: {
    id: 'round_window',
    name: 'Round Window & Secondary Tympanic Membrane (Fenestra Cochleae)',
    shortName: 'Round Window & Sec. Membrane',
    aka: 'Fenestra Cochleae & Membrana Tympani Secundaria',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial (Posteroinferior)',
    tier: 1,
    parentGroup: 'round_window',
    aliases: [
      'round window',
      'fenestra cochleae',
      'secondary tympanic membrane',
      'cochlear window',
      'fenestra rotunda',
      'round window membrane'
    ],
    boxColor: 0x2dd4bf,
    tissueColor: 0x5eead4,
    summary:
      'Circular opening posteroinferior to the promontory communicating with the Scala Tympani of the cochlea and sealed by the flexible three-layered Secondary Tympanic Membrane.',
    relations:
      'Sheltered beneath the overhanging Round Window Niche (Subiculum); faces posteroinferiorly.',
    supply: 'Allows pressure relief for incompressible inner-ear perilymph.',
    clinicalPearl:
      'Vibrates 180° OUT OF PHASE with the stapes at the oval window so incompressible cochlear perilymph can displace and flex the basilar membrane. Also a common portal for cochlear implant electrode insertion!',
    quizClue:
      'Opening posteroinferior to the promontory sealed by the secondary tympanic membrane that bulges in 180-degree opposite phase to stapes motion.',
    quizHint: 'Look posteroinferior to the Promontory on the Medial Wall for the teal membrane.'
  },

  round_window_niche: {
    id: 'round_window_niche',
    name: 'Round Window Niche & Subiculum Hood (Fossula Fenestrae Cochleae)',
    shortName: 'Round Window Niche (Subiculum)',
    aka: 'Fossula Fenestrae Cochleae & Subiculum Promontorii',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial (Posteroinferior)',
    tier: 3,
    parentGroup: 'round_window',
    parentName: 'Round Window Complex',
    aliases: ['round window niche', 'subiculum', 'fossula fenestrae cochleae', 'subiculum promontorii'],
    boxColor: 0x14b8a6,
    tissueColor: 0xdfd0be,
    summary:
      'Overhanging bony hood and depression (bounded superiorly/posteriorly by the Subiculum ridge from the promontory) that shields the Round Window Membrane so it faces posteroinferiorly in real temporal-bone specimens.',
    relations:
      'Separates the Round Window inferiorly from the Sinus Tympani posterosuperiorly.',
    supply: 'Otic capsule bony overhang.',
    clinicalPearl:
      'During cochlear implant surgery via the round window, surgeons often drill back this overhanging bony niche ("bony overhang") just enough to visualize the true Secondary Tympanic Membrane beneath it!',
    quizClue:
      'Overhanging bony hood (fossula / subiculum) posteroinferior to the promontory that shelters the secondary tympanic membrane from direct lateral view.',
    quizHint: 'Look at the curved bony hood overhanging the Round Window posteroinferior to the Promontory.'
  },

  facial_canal_prominence: {
    id: 'facial_canal_prominence',
    name: 'Prominence of Facial Nerve Canal (Fallopian Canal)',
    shortName: 'Facial Canal Prominence',
    aka: 'Prominentia Canalis Facialis (Horizontal Tympanic Segment)',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial -> Posterior',
    tier: 2,
    aliases: [
      'prominence of facial nerve canal',
      'facial canal prominence',
      'prominence of facial canal',
      'facial nerve canal',
      'fallopian canal',
      'facial canal'
    ],
    boxColor: 0xfbbf24,
    tissueColor: 0xe7d3b8,
    summary:
      'Oblique cylindrical bony ridge running anteroposteriorly across the medial wall immediately superior to the Oval Window and inferior to the Lateral Semicircular Canal before bending downward at the second genu.',
    relations:
      'Begins anteriorly just behind Processus Cochleariformis and runs above the stapes/oval window.',
    supply: 'Encloses tympanic segment of CN VII.',
    clinicalPearl:
      'Naturally dehiscent (lacking bone cover) right above the oval window in ~10–15% of people — placing bare CN VII at high risk during stapedectomy, cholesteatoma removal, or acute otitis media!',
    quizClue:
      'Oblique cylindrical bony ridge on the medial wall running immediately superior to the oval window and inferior to the lateral semicircular canal.',
    quizHint: 'Look at the horizontal tubular ridge directly ABOVE the Oval Window on the Medial Wall.'
  },

  lateral_scc_prominence: {
    id: 'lateral_scc_prominence',
    name: 'Prominence of Lateral Semicircular Canal',
    shortName: 'Lateral SCC Prominence',
    aka: 'Prominentia Canalis Semicircularis Lateralis',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial (Posterosuperior)',
    tier: 2,
    aliases: [
      'prominence of lateral semicircular canal',
      'lateral semicircular canal prominence',
      'lateral scc prominence',
      'horizontal semicircular canal prominence'
    ],
    boxColor: 0xfda4af,
    tissueColor: 0xdfd0bc,
    summary:
      'Broad smooth dense otic-capsule bulge high on the posterosuperior medial wall extending into the medial wall of the Aditus.',
    relations:
      'Positioned immediately SUPERIOR to the Prominence of the Facial Nerve Canal (CN VII).',
    supply: 'Dense endochondral bone of otic capsule.',
    clinicalPearl:
      'Cholesteatoma erosion of this ridge creates a perilymphatic fistula — loud noises (Tullio phenomenon) or ear-canal pressure (fistula test) trigger sudden rotary vertigo and nystagmus!',
    quizClue:
      'Smooth dense bony bulge high on the posterosuperior medial wall located immediately SUPERIOR to the facial nerve canal prominence.',
    quizHint: 'Look at the highest horizontal bulge on the posterosuperior Medial Wall right ABOVE the facial canal.'
  },

  processus_cochleariformis: {
    id: 'processus_cochleariformis',
    name: 'Processus Cochleariformis (Cochleariform Process)',
    shortName: 'Processus Cochleariformis',
    aka: 'Curved Spoon-Shaped Bony Pulley for Tensor Tympani Tendon',
    category: CATEGORIES.MEDIAL,
    wall: 'Medial (Anterosuperior)',
    tier: 2,
    aliases: ['processus cochleariformis', 'cochleariform process', 'tensor tympani pulley'],
    boxColor: 0xfb923c,
    tissueColor: 0xe6d6c3,
    summary:
      'Curved, spoon-like bony projection marking the posterior termination of the tensor tympani semicanal on the anterosuperior medial wall.',
    relations:
      'Acts as a 90° frictionless pulley redirecting the Tendon of Tensor Tympani laterally to the malleus; marks the anterior start of the horizontal segment of CN VII just behind it.',
    supply: 'Dense petrous bone resistant to cholesteatoma erosion.',
    clinicalPearl:
      'Prized surgical landmark: even when disease destroys the ossicles, the durable processus cochleariformis reliably points to the geniculate ganglion / anterior tympanic CN VII immediately superomedial to it!',
    quizClue:
      'Curved spoon-shaped bony hook on the anterosuperior medial wall that acts as a 90-degree pulley for the tensor tympani tendon.',
    quizHint: 'Follow the white Tensor Tympani tendon medially from the malleus to its curved spoon-like bony pulley on the Medial Wall.'
  },

  // =========================================================================
  // 3. ANTERIOR & POSTERIOR WALL FEATURES (5)
  // =========================================================================
  aditus_to_antrum: {
    id: 'aditus_to_antrum',
    name: 'Aditus to Mastoid Antrum (Aditus ad Antrum)',
    shortName: 'Aditus to Mastoid Antrum',
    aka: 'Aditus ad Antrum Mastoideum',
    category: CATEGORIES.OPENINGS,
    wall: 'Posterior (Superior Attic)',
    tier: 1,
    aliases: ['aditus to mastoid antrum', 'aditus ad antrum', 'aditus', 'aditus to antrum'],
    boxColor: 0xfacc15,
    tissueColor: 0x93c5fd,
    summary:
      'Large irregular archway high in the Posterior Wall connecting the Epitympanic Recess anteriorly with the Mastoid Antrum and air cells posteriorly.',
    relations:
      'Medial wall bears the Lateral SCC prominence; inferior sill bears Fossa Incudis and the second genu of CN VII.',
    supply: 'Continuous respiratory/cuboidal mucoperiosteum.',
    clinicalPearl:
      'Pathway by which acute otitis media spreads directly backward into the mastoid air cells, producing acute coalescent mastoiditis (postauricular erythema/fluctuance pushing the pinna anteroinferiorly).',
    quizClue:
      'Archway in the upper posterior wall connecting the epitympanic recess directly to the mastoid antrum.',
    quizHint: 'Look high on the Posterior Wall for the arched open doorway leading into the mastoid air cells.'
  },

  fossa_incudis: {
    id: 'fossa_incudis',
    name: 'Fossa Incudis',
    shortName: 'Fossa Incudis',
    aka: 'Posterior Epitympanic Recess Cup for Short Limb of Incus',
    category: CATEGORIES.OPENINGS,
    wall: 'Posterior (Just Below Aditus)',
    tier: 3,
    aliases: ['fossa incudis', 'incudal fossa'],
    boxColor: 0xfde047,
    tissueColor: 0xdfd0ba,
    summary:
      'Small cup-like bony depression in the posteroinferior angle of the Epitympanic Recess right on the floor/sill of the Aditus ad Antrum.',
    relations:
      'Receives the tip of the Short Limb (Crus Breve) of the Incus anchored by the fan-like Posterior Incudal Ligament; forms the superior apex of the surgical "facial recess" triangle just above the 2nd genu of CN VII!',
    supply: 'Petromastoid bone.',
    clinicalPearl:
      'Key otologic landmark: when drilling into the antrum, finding the Short Limb of the Incus pointing into Fossa Incudis tells the surgeon that the Facial Nerve (CN VII) lies immediately MEDIAL and INFERIOR to this tip!',
    quizClue:
      'Small bony depression on the posterior wall just below the aditus that lodges the short limb of the incus and posterior incudal ligament.',
    quizHint: 'Follow the horizontal Short Limb of the Incus backward to the small bony cup on the Posterior Wall right below the Aditus.'
  },

  pyramidal_eminence: {
    id: 'pyramidal_eminence',
    name: 'Pyramidal Eminence (Pyramid)',
    shortName: 'Pyramidal Eminence',
    aka: 'Eminentia Pyramidalis',
    category: CATEGORIES.OPENINGS,
    wall: 'Posterior',
    tier: 2,
    aliases: ['pyramidal eminence', 'eminentia pyramidalis', 'pyramid', 'pyramid of middle ear'],
    boxColor: 0xf59e0b,
    tissueColor: 0xe6d4bc,
    summary:
      'Hollow volcano-shaped conical bony projection on the Posterior Wall immediately anterior to the vertical mastoid segment of the facial canal.',
    relations:
      'Encloses the belly of the Stapedius Muscle; its pinpoint apical pore transmits the Tendon of Stapedius forward to the neck of the stapes.',
    supply: 'Perforated posteriorly by a minute canaliculus from CN VII for the nerve to stapedius.',
    clinicalPearl:
      'Marks the level of the second genu / upper mastoid segment of CN VII immediately behind it, and divides the retrotympanum into the facial recess laterally and sinus tympani medially.',
    quizClue:
      'Hollow volcano-like conical bony projection on the posterior wall housing the stapedius muscle belly and perforated at its apex by its tendon.',
    quizHint: 'Look on the Posterior Wall behind the stapes for the pointed volcano-like bony cone.'
  },

  tensor_tympani_semicanal: {
    id: 'tensor_tympani_semicanal',
    name: 'Semicanal for Tensor Tympani Muscle',
    shortName: 'Tensor Tympani Semicanal',
    aka: 'Semicanalis Musculi Tensoris Tympani (Upper Musculotubal Canal)',
    category: CATEGORIES.OPENINGS,
    wall: 'Anterior (Superior)',
    tier: 2,
    parentGroup: 'tensor_tympani',
    parentName: 'Tensor Tympani Complex',
    aliases: ['semicanal for tensor tympani', 'tensor tympani semicanal', 'tensor tympani canal', 'canal for tensor tympani'],
    boxColor: 0x60a5fa,
    tissueColor: 0xc8b8a2,
    summary:
      'Superior bony half-canal of the musculotubal canal opening on the upper Anterior Wall and extending onto the medial wall as a C-shaped bony shelf ending at Processus Cochleariformis.',
    relations:
      'Separated from the Auditory (Eustachian) Tube directly beneath it by a thin bony septum.',
    supply: 'Roofed by Tegmen Tympani.',
    clinicalPearl:
      'Forms the upper barrel of the double-barreled "musculotubal canal" of the temporal bone (muscle above, Eustachian tube below).',
    quizClue:
      'Superior bony tunnel and C-shaped shelf opening on the upper anterior wall above the auditory tube, cradling the tensor tympani muscle belly.',
    quizHint: 'Look at the bony rim and shelf cradling the Tensor Tympani muscle high on the Anterior/Medial junction.'
  },

  eustachian_tube: {
    id: 'eustachian_tube',
    name: 'Auditory Tube (Pharyngotympanic / Eustachian Tube)',
    shortName: 'Auditory (Eustachian) Tube',
    aka: 'Tuba Auditiva / Pharyngotympanic Tube',
    category: CATEGORIES.OPENINGS,
    wall: 'Anterior',
    tier: 1,
    aliases: ['eustachian tube', 'auditory tube', 'pharyngotympanic tube', 'tuba auditiva'],
    boxColor: 0x2563eb,
    tissueColor: 0xd98a82,
    summary:
      '~36 mm hourglass osteocartilaginous channel (posterolateral 1/3 bony, narrow isthmus, anteromedial 2/3 slit-like cartilaginous) descending ~45° anteriorly, medially, and inferiorly from the Anterior Wall to the nasopharynx.',
    relations:
      'Opens on the Anterior Wall INFERIOR to the tensor tympani semicanal and SUPERIOR/POSTERIOR to the internal carotid artery.',
    supply: 'Actively opened during swallowing/yawning by Tensor Veli Palatini (CN V3) and Levator Veli Palatini / Salpingopharyngeus (CN X).',
    clinicalPearl:
      'Equalizes middle-ear air pressure! In infants it is shorter, wider, and much more horizontal (~10° vs 45°), explaining why nasopharyngeal infections and milk reflux readily cause acute otitis media.',
    quizClue:
      'Osteocartilaginous tunnel opening on the anterior wall below the tensor tympani canal that equalizes middle-ear pressure with the nasopharynx.',
    quizHint: 'Look at the large funnel opening in the middle of the Anterior Wall.'
  },

  // =========================================================================
  // 4. AUDITORY OSSICLES — INDIVIDUAL SUB-PARTS, JOINTS & LIGAMENTS (15)
  // =========================================================================
  malleus_head: {
    id: 'malleus_head',
    name: 'Head (Caput) of Malleus',
    shortName: 'Head of Malleus',
    aka: 'Caput Mallei (in Epitympanic Recess)',
    category: CATEGORIES.OSSICLES,
    wall: 'Epitympanic Recess (Attic)',
    tier: 2,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Malleus',
    aliases: ['head of malleus', 'malleus head', 'caput mallei', 'capitulum of malleus', 'mallear head'],
    boxColor: 0xf8fafc,
    tissueColor: 0xf3ead8,
    summary:
      'Large ovoid club-shaped superior extremity of the Malleus projecting upward into the Epitympanic Recess above the Tympanic Membrane.',
    relations:
      'Bears a posteromedial saddle-shaped synovial facet articulating with the Body of the Incus; tethered to the Tegmen Tympani roof by the Superior Mallear Ligament.',
    supply: '1st Pharyngeal Arch (Meckel’s cartilage); anterior tympanic arterial twigs.',
    clinicalPearl:
      'In "attic fixation" (tympanosclerosis or bony ankylosis of the malleus head to the Tegmen Tympani or Scutum), the ossicular chain stiffens — mimicking otosclerosis with conductive hearing loss!',
    quizClue:
      'Large ovoid club-shaped superior end of the malleus residing in the epitympanic recess and articulating posteromedially with the body of the incus.',
    quizHint: 'Look up in the Attic at the rounded club-like top of the Malleus.'
  },

  malleus_neck: {
    id: 'malleus_neck',
    name: 'Neck (Collum) of Malleus',
    shortName: 'Neck of Malleus',
    aka: 'Collum Mallei',
    category: CATEGORIES.OSSICLES,
    wall: 'Junction of Attic & Tympanic Cavity',
    tier: 3,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Malleus',
    aliases: ['neck of malleus', 'malleus neck', 'collum mallei', 'mallear neck'],
    boxColor: 0xf1f5f9,
    tissueColor: 0xefe4cf,
    summary:
      'Narrow constricted waist of the Malleus situated immediately below the ovoid Head and above the processes and handle.',
    relations:
      'Lies directly medial to Pars Flaccida (forming the medial boundary of Prussak’s space!). Crossed on its MEDIAL surface by the Chorda Tympani nerve; receives the Tendon of Tensor Tympani near its medial base.',
    supply: '1st Pharyngeal Arch.',
    clinicalPearl:
      'High-yield double relation at the Neck of the Malleus: LATERALLY sits Prussak’s space (pars-flaccida cholesteatoma pocket), and MEDIALLY runs the bare Chorda Tympani nerve!',
    quizClue:
      'Constricted waist of the malleus below the head that bounds Prussak’s space medially (opposite pars flaccida) and is crossed on its medial side by the chorda tympani.',
    quizHint: 'Look at the narrowed waist of the Malleus just below its club head, right where the Chorda Tympani crosses.'
  },

  malleus_manubrium: {
    id: 'malleus_manubrium',
    name: 'Handle (Manubrium) of Malleus',
    shortName: 'Handle (Manubrium) of Malleus',
    aka: 'Manubrium Mallei',
    category: CATEGORIES.OSSICLES,
    wall: 'Embedded in Tympanic Membrane',
    tier: 1,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Malleus',
    aliases: ['handle of malleus', 'manubrium of malleus', 'manubrium mallei', 'malleus handle', 'malleus manubrium', 'manubrium'],
    boxColor: 0xf8fafc,
    tissueColor: 0xf5ecdc,
    summary:
      'Long, laterally compressed, downward-and-backward tapering arm of the Malleus firmly embedded between the mucosal and fibrous layers of the Tympanic Membrane down to its spatulate tip at the Umbo.',
    relations:
      'Visible directly through the translucent eardrum on otoscopy as the "mallear stria". Its ~1.3× greater length compared to the incus long limb produces the ossicular lever gain.',
    supply: '1st Pharyngeal Arch.',
    clinicalPearl:
      'On otoscopy of a retracted eardrum, the Handle of the Malleus appears Foreshortened and more horizontal as negative middle-ear pressure pulls it medially toward the promontory!',
    quizClue:
      'Long spatulate arm of the malleus embedded within the tympanic membrane from the lateral process down to the umbo, providing ~1.3x lever advantage.',
    quizHint: 'Look at the long vertical arm of the Malleus attached down the center of the Tympanic Membrane to the Umbo.'
  },

  malleus_lateral_process: {
    id: 'malleus_lateral_process',
    name: 'Lateral Process of Malleus',
    shortName: 'Lateral Process of Malleus',
    aka: 'Processus Lateralis (Processus Brevis) Mallei',
    category: CATEGORIES.OSSICLES,
    wall: 'Superior Tympanic Membrane',
    tier: 3,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Malleus',
    aliases: ['lateral process of malleus', 'malleus lateral process', 'processus lateralis mallei', 'short process of malleus', 'processus brevis'],
    boxColor: 0xe2e8f0,
    tissueColor: 0xf3ead8,
    summary:
      'Conical cartilaginous-capped projection jutting superolaterally from the root of the Malleus handle into the Tympanic Membrane.',
    relations:
      'Serves as the focal apex from which the Anterior and Posterior Mallear Folds radiate upward to the Notch of Rivinus (separating Pars Flaccida above from Pars Tensa below).',
    supply: '1st Pharyngeal Arch.',
    clinicalPearl:
      'The single most reliable landmark on clinical otoscopy! Even when an inflamed or retracted eardrum obscures everything else, the prominent white knuckle of the Lateral Process stands out near 12–1 o’clock.',
    quizClue:
      'Conical projection at the upper root of the malleus handle that juts laterally into the eardrum at the junction of the anterior and posterior mallear folds.',
    quizHint: 'Look for the short conical spike jutting laterally from the upper Malleus handle right into the eardrum.'
  },

  malleus_anterior_process: {
    id: 'malleus_anterior_process',
    name: 'Anterior Process of Malleus',
    shortName: 'Anterior Process of Malleus',
    aka: 'Processus Anterior (Processus Gracilis / Folian Process)',
    category: CATEGORIES.OSSICLES,
    wall: 'Anterior Tympanic Cavity -> Petrotympanic Fissure',
    tier: 3,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Malleus',
    aliases: ['anterior process of malleus', 'malleus anterior process', 'processus anterior mallei', 'processus gracilis'],
    boxColor: 0xe2e8f0,
    tissueColor: 0xeee3ce,
    summary:
      'Slender, delicate bony spine projecting anteriorly and slightly inferiorly from the Neck of the Malleus toward the Petrotympanic (Glaserian) Fissure.',
    relations:
      'Connected via the Anterior Mallear Ligament through the petrotympanic fissure to the sphenomandibular ligament (shared 1st-arch Meckel’s cartilage continuum!); closely accompanied by the exiting Chorda Tympani.',
    supply: 'Membranous ossification adjacent to Meckel’s cartilage; longest proportionally in fetuses/infants.',
    clinicalPearl:
      'Embryological Rosetta Stone: in the fetus, this anterior process is directly continuous through the petrotympanic fissure with Meckel’s cartilage of the mandible!',
    quizClue:
      'Slender spine-like projection extending anteriorly from the neck of the malleus toward the petrotympanic fissure (remnant of Meckel’s cartilage continuity).',
    quizHint: 'Look at the fine needle-like spine pointing forward (+X) from the neck of the Malleus.'
  },

  mallear_ligaments: {
    id: 'mallear_ligaments',
    name: 'Suspensory Ligaments of Malleus (Superior & Lateral)',
    shortName: 'Mallear Suspensory Ligaments',
    aka: 'Ligamentum Mallei Superius & Laterale',
    category: CATEGORIES.OSSICLES,
    wall: 'Epitympanic Recess',
    tier: 3,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Malleus',
    aliases: [
      'suspensory ligaments of malleus',
      'mallear ligaments',
      'ligaments of malleus',
      'superior mallear ligament',
      'lateral mallear ligament'
    ],
    boxColor: 0xcbd5e1,
    tissueColor: 0xe2e8f0,
    summary:
      'Fibrous suspensory bands stabilizing the rotational axis of the Malleus in the attic: the Superior Mallear Ligament descends from the Tegmen Tympani to the Malleus Head, and the Lateral Mallear Ligament fans from the Neck to the Notch of Rivinus / Scutum.',
    relations:
      'The Lateral Mallear Ligament forms the roof of Prussak’s space (just medial to Pars Flaccida)!',
    supply: 'Collagenous mucosal-invested ligaments.',
    clinicalPearl:
      'Together with the Anterior Mallear Ligament and Posterior Incudal Ligament, these bands define the low-inertia anteroposterior rotational fulcrum around which the malleus-incus lever rocks!',
    quizClue:
      'Fibrous bands suspending the head and neck of the malleus from the tegmen tympani roof and lateral scutum/Rivinus margin (forming the roof of Prussak’s space).',
    quizHint: 'Look at the pale fibrous straps tethering the top of the Malleus head to the Roof and its neck to the upper Lateral Wall.'
  },

  incudomallear_joint: {
    id: 'incudomallear_joint',
    name: 'Incudomallear Joint (Saddle Synovial Articulation)',
    shortName: 'Incudomallear Joint',
    aka: 'Articulatio Incudomallearis',
    category: CATEGORIES.OSSICLES,
    wall: 'Epitympanic Recess (Attic)',
    tier: 3,
    isOssicle: true,
    parentGroup: 'malleus',
    parentName: 'Ossicular Joints',
    aliases: ['incudomallear joint', 'malleoincudal joint', 'articulatio incudomallearis', 'saddle joint of middle ear'],
    boxColor: 0xbfdbfe,
    tissueColor: 0xdbeafe,
    summary:
      'True diarthrodial (synovial) SADDLE joint lined by hyaline articular cartilage and enclosed by an elastic joint capsule uniting the posteromedial Head of the Malleus with the anterior Body of the Incus in the attic.',
    relations:
      'At normal physiological sound levels, the malleus and incus lock and rock together as a single rigid lever unit; during violent pressure changes (sneezing/barotrauma), slight saddle-joint glide protects the stapes from avulsion out of the oval window!',
    supply: '1st Pharyngeal Arch synovial articulation.',
    clinicalPearl:
      'Exam favorite joint-type contrast: Incudomallear joint = SADDLE synovial joint; Incudostapedial joint = BALL-AND-SOCKET synovial joint! (And rheumatoid arthritis can occasionally inflame them!)',
    quizClue:
      'Synovial SADDLE joint in the epitympanic recess uniting the posteromedial facet of the malleus head with the body of the incus.',
    quizHint: 'Look in the Attic right at the bluish-white hyaline cartilage collar joining the Head of the Malleus and Body of the Incus.'
  },

  incus_body: {
    id: 'incus_body',
    name: 'Body (Corpus) of Incus',
    shortName: 'Body of Incus',
    aka: 'Corpus Incudis (Anvil Crown in Attic)',
    category: CATEGORIES.OSSICLES,
    wall: 'Epitympanic Recess (Attic)',
    tier: 1,
    isOssicle: true,
    parentGroup: 'incus',
    parentName: 'Incus',
    aliases: ['body of incus', 'incus body', 'corpus incudis'],
    boxColor: 0xe2e8f0,
    tissueColor: 0xede2cd,
    summary:
      'Laterally compressed, blocky premolar-crown-shaped superior mass of the Incus lodged in the Epitympanic Recess.',
    relations:
      'Articulates anteriorly with the Head of the Malleus via the saddle-shaped Incudomallear Joint; gives rise posteriorly to the Short Limb and inferiorly to the Long Limb.',
    supply: '1st Pharyngeal Arch.',
    clinicalPearl:
      'On axial temporal-bone CT through the attic, the Malleus Head in front of the triangular Incus Body & Short Limb creates the classic "Ice-Cream Cone Sign" (Malleus head = scoop, Incus body/short limb = cone) — dislocated in longitudinal temporal-bone fractures!',
    quizClue:
      'Bulky, laterally compressed crown of the incus residing in the epitympanic recess ("cone" of the CT ice-cream-cone sign behind the malleus head).',
    quizHint: 'Look up in the Attic at the broad, anvil-like upper block of the Incus right behind the Malleus head.'
  },

  incus_short_limb: {
    id: 'incus_short_limb',
    name: 'Short Limb (Crus Breve) of Incus & Posterior Incudal Ligament',
    shortName: 'Short Limb of Incus',
    aka: 'Crus Breve Incudis & Ligamentum Incudis Posterius',
    category: CATEGORIES.OSSICLES,
    wall: 'Epitympanic Recess -> Fossa Incudis',
    tier: 2,
    isOssicle: true,
    parentGroup: 'incus',
    parentName: 'Incus',
    aliases: [
      'short limb of incus',
      'short process of incus',
      'crus breve',
      'crus breve of incus',
      'incus short limb',
      'incus short process'
    ],
    boxColor: 0xe2e8f0,
    tissueColor: 0xebe0ca,
    summary:
      'Stout conical horizontal projection tapering backward from the Body of the Incus toward the posterior attic wall, tethered inside Fossa Incudis by the Posterior Incudal Ligament.',
    relations:
      'Points directly toward the Aditus ad Antrum; the horizontal/2nd-genu Facial Nerve (CN VII) passes immediately inferomedial to its tip!',
    supply: '1st Pharyngeal Arch.',
    clinicalPearl:
      'Forms the posterior rotational pivot point of the malleus-incus rotational axis and serves as the surgeon’s "pointer" to CN VII during mastoidectomy!',
    quizClue:
      'Conical horizontal process of the incus projecting posteriorly from its body to anchor via ligament inside the fossa incudis below the aditus.',
    quizHint: 'Look at the horizontal cone-shaped arm of the Incus pointing straight backward (-X) into the Posterior Wall below the Aditus.'
  },

  incus_long_limb: {
    id: 'incus_long_limb',
    name: 'Long Limb (Crus Longum) of Incus',
    shortName: 'Long Limb of Incus',
    aka: 'Crus Longum Incudis',
    category: CATEGORIES.OSSICLES,
    wall: 'Tympanic Cavity (Posteromedial to Malleus Handle)',
    tier: 2,
    isOssicle: true,
    parentGroup: 'incus',
    parentName: 'Incus',
    aliases: [
      'long limb of incus',
      'long process of incus',
      'crus longum',
      'crus longum of incus',
      'incus long limb',
      'incus long process'
    ],
    boxColor: 0xe2e8f0,
    tissueColor: 0xede2cd,
    summary:
      'Slender vertical shaft descending nearly parallel and posteromedial to the Handle of the Malleus before bending medially at its distal tip into the Lenticular Process.',
    relations:
      'The Chorda Tympani nerve crosses LATERAL to the upper Long Limb of the Incus (and medial to the Malleus neck)! Being ~1.3× shorter than the malleus handle, it amplifies force delivered to the stapes.',
    supply: '1st Pharyngeal Arch; supplied by a delicate end-arterial watershed mucosal network.',
    clinicalPearl:
      'HIGHEST-YIELD OSSICULAR PATHOLOGY: Because its distal blood supply is a fragile watershed zone, the Long Limb of the Incus is the #1 site of avascular necrosis and ossicular chain discontinuity in chronic otitis media or cholesteatoma!',
    quizClue:
      'Slender vertical descending shaft of the incus (medial to chorda tympani) with a tenuous watershed blood supply making it the most common site of ossicular necrosis.',
    quizHint: 'Look at the slender vertical leg of the Incus descending behind and medial to the Malleus handle.'
  },

  incus_lenticular_process: {
    id: 'incus_lenticular_process',
    name: 'Lenticular Process of Incus & Incudostapedial Joint',
    shortName: 'Lenticular Process (IS Joint)',
    aka: 'Processus Lenticularis & Articulatio Incudostapedia (Ball-and-Socket)',
    category: CATEGORIES.OSSICLES,
    wall: 'Tympanic Cavity (Meeting Stapes Head)',
    tier: 3,
    isOssicle: true,
    parentGroup: 'incus',
    parentName: 'Incus',
    aliases: [
      'lenticular process',
      'lenticular process of incus',
      'incudostapedial joint',
      'processus lenticularis',
      'incus lenticular process'
    ],
    boxColor: 0xbae6fd,
    tissueColor: 0xdbeafe,
    summary:
      'Tiny disk/button-like medial knob hooking 90° medially from the inferior tip of the Long Limb of the Incus to form the synovial BALL-AND-SOCKET Incudostapedial Joint with the cupped Head of the Stapes.',
    relations:
      'Connected to the long limb by an ultra-thin pedicle; transfers 1st-arch ossicular motion onto the 2nd-arch stapes.',
    supply: 'Most distal watershed point of incudal circulation.',
    clinicalPearl:
      'Traumatic head blows or chronic middle-ear pressure frequently dislocate or resorb the Incudostapedial Joint / Lenticular Process, producing a large (~40–50 dB) conductive air-bone gap with a hypermobile ("flaccid", Type Ad tympanogram) eardrum!',
    quizClue:
      'Tiny button-shaped medial knob at the distal tip of the incus long limb forming a ball-and-socket synovial joint with the head of the stapes.',
    quizHint: 'Look right at the tiny bluish-white button joint where the bottom tip of the Incus meets the Head of the Stapes.'
  },

  stapes_head_neck: {
    id: 'stapes_head_neck',
    name: 'Head (Capitulum) & Neck of Stapes',
    shortName: 'Head & Neck of Stapes',
    aka: 'Caput & Collum Stapedis (Stapedius Insertion Site)',
    category: CATEGORIES.OSSICLES,
    wall: 'Tympanic Cavity (Lateral End of Stapes)',
    tier: 3,
    isOssicle: true,
    parentGroup: 'stapes',
    parentName: 'Stapes',
    aliases: [
      'head of stapes',
      'neck of stapes',
      'head and neck of stapes',
      'capitulum of stapes',
      'caput stapedis',
      'stapes head',
      'stapes neck'
    ],
    boxColor: 0xcbd5e1,
    tissueColor: 0xf7efe0,
    summary:
      'Cupped lateral articular Head (Capitulum) receiving the Lenticular Process of the Incus, followed medially by a constricted Neck bearing a tiny posterior muscular tubercle before splitting into the two crura.',
    relations:
      'The Tendon of the Stapedius Muscle inserts directly onto the POSTERIOR surface of the Neck of the Stapes!',
    supply: '2nd Pharyngeal Arch (Reichert’s cartilage).',
    clinicalPearl:
      'Pulling on the posterior Neck of the Stapes tilts the stapes footplate in the oval window (like opening a tiny door rather than pushing a piston), damping excessive sound amplitude before it injures cochlear hair cells!',
    quizClue:
      'Cupped lateral articular end and constricted waist of the stapes that articulates with the lenticular process and receives the stapedius tendon posteriorly.',
    quizHint: 'Look at the lateral tip and narrow neck of the Stapes right where the white Stapedius tendon attaches.'
  },

  stapes_anterior_crus: {
    id: 'stapes_anterior_crus',
    name: 'Anterior Crus (Limb) of Stapes',
    shortName: 'Anterior Crus of Stapes',
    aka: 'Crus Anterius Stapedis (Shorter, Straighter Leg)',
    category: CATEGORIES.OSSICLES,
    wall: 'Tympanic Cavity -> Anterior Oval Window',
    tier: 3,
    isOssicle: true,
    parentGroup: 'stapes',
    parentName: 'Stapes',
    aliases: ['anterior crus of stapes', 'anterior limb of stapes', 'stapes anterior crus', 'crus anterius', 'anterior leg of stapes'],
    boxColor: 0xe2e8f0,
    tissueColor: 0xf7efe0,
    summary:
      'The anterior of the two hollow-grooved arches of the Stapes stirrup extending from the neck to the anterior pole of the footplate. Anatomically SHORTER, THINNER, and LESS CURVED (straighter) than the posterior crus!',
    relations:
      'Insert near the fissula ante fenestram at the anterior margin of the Oval Window.',
    supply: '2nd Pharyngeal Arch.',
    clinicalPearl:
      'Specimen-siding rule for anatomy practicals: compare the two legs of an isolated stapes — the STRAIGHTER, thinner leg is ALWAYS the Anterior Crus, and the thicker, MORE BOWED leg is ALWAYS the Posterior Crus!',
    quizClue:
      'The shorter, thinner, and STRAIGHTER of the two stirrup legs of the stapes extending to the anterior end of the footplate.',
    quizHint: 'Look at the two legs of the Stapes — aim at the MORE ANTERIOR (+X), straighter leg.'
  },

  stapes_posterior_crus: {
    id: 'stapes_posterior_crus',
    name: 'Posterior Crus (Limb) of Stapes',
    shortName: 'Posterior Crus of Stapes',
    aka: 'Crus Posterius Stapedis (Longer, More Curved Leg)',
    category: CATEGORIES.OSSICLES,
    wall: 'Tympanic Cavity -> Posterior Oval Window',
    tier: 3,
    isOssicle: true,
    parentGroup: 'stapes',
    parentName: 'Stapes',
    aliases: [
      'posterior crus of stapes',
      'posterior limb of stapes',
      'stapes posterior crus',
      'crus posterius',
      'posterior leg of stapes'
    ],
    boxColor: 0xcbd5e1,
    tissueColor: 0xf5ecdc,
    summary:
      'The posterior of the two stirrup arches of the Stapes extending from the neck (near the stapedius attachment) to the posterior pole of the footplate. Anatomically LONGER, THICKER, and NOTICEABLY MORE BOWED/CURVED than the anterior crus!',
    relations:
      'Curves backward toward the Pyramidal Eminence before sweeping medially to the posterior footplate; bounds the translucent obturator membrane posteriorly.',
    supply: '2nd Pharyngeal Arch.',
    clinicalPearl:
      'In laser stapedotomy for otosclerosis, surgeons vaporize the Stapedius tendon and divide the thick Posterior Crus and thin Anterior Crus to replace the immobilized arch with a piston prosthesis!',
    quizClue:
      'The longer, thicker, and noticeably MORE CURVED/BOWED of the two stirrup legs of the stapes, closest to the stapedius tendon insertion.',
    quizHint: 'Look at the two legs of the Stapes — aim at the MORE POSTERIOR (-X), noticeably bowed/curved leg.'
  },

  stapes_footplate: {
    id: 'stapes_footplate',
    name: 'Footplate (Base) of Stapes & Obturator Membrane',
    shortName: 'Footplate of Stapes',
    aka: 'Basis Stapedis (~3.2 mm² Reniform Plate in Oval Window)',
    category: CATEGORIES.OSSICLES,
    wall: 'Seated in Oval Window (Medial Wall)',
    tier: 1,
    isOssicle: true,
    parentGroup: 'stapes',
    parentName: 'Stapes',
    aliases: [
      'footplate of stapes',
      'base of stapes',
      'stapes footplate',
      'stapedial footplate',
      'basis stapedis',
      'stapes base'
    ],
    boxColor: 0x94a3b8,
    tissueColor: 0xf8f0e2,
    summary:
      'Thin, kidney-shaped (reniform — arched superior border, straighter/indented inferior border) oval bony plate (~3.2 mm²) uniting the two crura of the Stapes and sealing the Oval Window via the elastic Annular Ligament (with the delicate Obturator Membrane spanning the arch).',
    relations:
      'Medial vestibular surface is bathed directly by perilymph of the Vestibule (utricle/saccule just millimeters behind it!).',
    supply: 'Dual embryology: lateral layer from 2nd Pharyngeal Arch; medial vestibular lamina partly from otic capsule!',
    clinicalPearl:
      'Its tiny ~3.2 mm² surface area concentrates force gathered by the ~55 mm² Tympanic Membrane (~17× hydraulic area gain × 1.3× lever = ~22× pressure amplification!), overcoming the 99.9% air-to-fluid acoustic reflection!',
    quizClue:
      'Kidney-shaped ~3.2 mm² bony base of the stapes seated in the oval window via the annular ligament (immobilized in otosclerosis).',
    quizHint: 'Look right inside the Oval Window on the Medial Wall at the flat kidney-shaped base plate of the Stapes.'
  },

  // =========================================================================
  // 5. MUSCLES, TENDONS & CRANIAL NERVE BRANCHES (10)
  // =========================================================================
  tensor_tympani_muscle: {
    id: 'tensor_tympani_muscle',
    name: 'Tensor Tympani Muscle Belly (CN V3)',
    shortName: 'Tensor Tympani Belly (CN V3)',
    aka: 'Musculus Tensor Tympani (in Semicanal)',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Anterior -> Upper Medial Semicanal',
    tier: 1,
    parentGroup: 'tensor_tympani',
    parentName: 'Tensor Tympani',
    aliases: ['tensor tympani muscle', 'tensor tympani muscle belly', 'belly of tensor tympani', 'musculus tensor tympani'],
    boxColor: 0xef4444,
    tissueColor: 0xc84b4b,
    summary:
      '~2 cm fusiform pennate skeletal muscle belly arising from the cartilaginous auditory tube and greater wing of sphenoid, coursing posteriorly through its bony semicanal above the Eustachian tube before narrowing into its tendon.',
    relations:
      'Lies directly superior to the Auditory Tube, roofed by Tegmen Tympani.',
    supply:
      'Innervated by Nerve to Tensor Tympani from Mandibular Nerve (CN V3 — 1st Pharyngeal Arch, matching the Malleus!).',
    clinicalPearl:
      'Contracts during chewing and speaking (CN V3!) and loud low-frequency sounds to tense the eardrum so your own mastication doesn’t deafen you; myoclonus of this muscle causes rhythmic clicking/fluttering tinnitus!',
    quizClue:
      'Striated fusiform muscle belly innervated by CN V3 lying inside the superior bony semicanal above the auditory tube before turning at processus cochleariformis.',
    quizHint: 'Aim directly at the red striated muscle belly lying along the upper Anterior/Medial semicanal shelf.'
  },

  tensor_tympani_tendon: {
    id: 'tensor_tympani_tendon',
    name: 'Tendon of Tensor Tympani Muscle',
    shortName: 'Tendon of Tensor Tympani',
    aka: '90° Pulley Tendon from Processus Cochleariformis to Malleus',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Processus Cochleariformis -> Medial Neck/Handle of Malleus',
    tier: 2,
    parentGroup: 'tensor_tympani',
    parentName: 'Tensor Tympani',
    aliases: ['tendon of tensor tympani', 'tensor tympani tendon', 'tendon of tensor tympani muscle'],
    boxColor: 0xf8fafc,
    tissueColor: 0xf8fafc,
    summary:
      'Glistening cylindrical white collagenous tendon that turns sharply ~90° laterally around the spoon-like Processus Cochleariformis pulley, crossing the air-filled tympanic cavity transversely to insert onto the medial aspect of the upper Handle / Neck of the Malleus.',
    relations:
      'Crosses from medial wall to lateral ossicle slightly inferior and anterior to the Chorda Tympani nerve.',
    supply: 'Transmits force of CN V3-innervated Tensor Tympani.',
    clinicalPearl:
      'In severe intractable Meniere’s / tensor-tympani syndrome or during wide attic exposure, cutting this white transverse cord releases medial pull on the malleus handle!',
    quizClue:
      'Glistening white cord hooking 90 degrees laterally around the processus cochleariformis across the middle-ear space to insert on the upper handle/neck of the malleus.',
    quizHint: 'Look at the white horizontal tendon cord stretching right across the middle-ear room from the spoon pulley to the Malleus.'
  },

  stapedius_muscle: {
    id: 'stapedius_muscle',
    name: 'Stapedius Muscle Belly (CN VII)',
    shortName: 'Stapedius Belly (CN VII)',
    aka: 'Musculus Stapedius (Smallest Skeletal Muscle in the Body)',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Enclosed within Hollow Pyramidal Eminence (Posterior Wall)',
    tier: 2,
    parentGroup: 'stapedius_muscle',
    parentName: 'Stapedius',
    aliases: ['stapedius muscle', 'stapedius muscle belly', 'belly of stapedius', 'musculus stapedius', 'stapedius'],
    boxColor: 0xdc2626,
    tissueColor: 0xd45050,
    summary:
      'The smallest skeletal muscle in the human body (~6 mm belly), completely encased within the hollow bony canal of the Pyramidal Eminence on the Posterior Wall just in front of the descending CN VII.',
    relations:
      'Receives a short direct twig (Nerve to Stapedius) through a posterior canaliculus from the adjacent mastoid segment of CN VII.',
    supply:
      'Innervated by Nerve to Stapedius, branch of Facial Nerve (CN VII — 2nd Pharyngeal Arch, matching the Stapes!).',
    clinicalPearl:
      'Primary effector of the bilateral Acoustic Stapedial Reflex (>70–85 dB sound -> CN VIII -> superior olivary complex -> bilateral CN VII -> stapedius contraction). Paralysis in Bell’s palsy proximal to stapedius branch causes painful HYPERACUSIS!',
    quizClue:
      'Smallest skeletal muscle belly in the human body, housed inside the hollow pyramidal eminence and innervated by CN VII.',
    quizHint: 'Turn on X-Ray walls [X] and look inside/behind the Pyramidal Eminence on the Posterior Wall for the small red muscle belly.'
  },

  stapedius_tendon: {
    id: 'stapedius_tendon',
    name: 'Tendon of Stapedius Muscle',
    shortName: 'Tendon of Stapedius',
    aka: 'Tendo Musculi Stapedii (~1–2 mm Apical Cord)',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Apex of Pyramidal Eminence -> Posterior Neck of Stapes',
    tier: 1,
    parentGroup: 'stapedius_muscle',
    parentName: 'Stapedius',
    aliases: ['tendon of stapedius', 'stapedius tendon', 'tendon of stapedius muscle', 'stapedial tendon'],
    boxColor: 0xfef2f2,
    tissueColor: 0xf8fafc,
    summary:
      'Tiny (~1–2 mm) glistening white tendon emerging forward through the pinpoint apical pore of the Pyramidal Eminence to insert onto the posterior muscular tubercle on the Neck of the Stapes.',
    relations:
      'Pulls the stapes neck posteriorly (away from the anterior oval window) to tilt the footplate and stiffen the annular ligament during loud noises.',
    supply: 'Transmits force of CN VII-innervated Stapedius.',
    clinicalPearl:
      'During stapedectomy surgery, this tiny white cord emerging from the apex of the pyramid is clearly visible right behind the stapes and is divided with micro-scissors or laser to mobilize the stapes!',
    quizClue:
      'Delicate white tendon emerging through the pinpoint apex of the pyramidal eminence to insert onto the posterior neck of the stapes.',
    quizHint: 'Look at the short white cord stretching forward from the tip of the Pyramidal Eminence to the back of the Stapes neck.'
  },

  facial_nerve_cn7: {
    id: 'facial_nerve_cn7',
    name: 'Facial Nerve Trunk (CN VII — Tympanic & Mastoid Segments)',
    shortName: 'Facial Nerve (CN VII)',
    aka: 'Intratemporal CN VII & Nerve to Stapedius',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Behind Medial Wall (Above Oval Window) & Posterior Wall',
    tier: 1,
    aliases: ['facial nerve', 'cn vii', 'cn 7', 'cranial nerve 7', 'cranial nerve vii', 'tympanic segment of facial nerve', 'mastoid segment of facial nerve'],
    boxColor: 0xfacc15,
    tissueColor: 0xfbbf24,
    summary:
      'Main trunk of Cranial Nerve VII coursing horizontally backward through the tympanic segment of the Fallopian canal above the Oval Window, turning inferiorly at the 2nd Genu (medial to Aditus/Fossa Incudis), and descending vertically through the mastoid wall to exit the Stylomastoid Foramen.',
    relations:
      'Gives off Greater Petrosal Nerve at 1st genu, Nerve to Stapedius behind the pyramid, and Chorda Tympani before exiting stylomastoid foramen.',
    supply: '2nd Pharyngeal Arch cranial nerve.',
    clinicalPearl:
      'Topographic lesion localization along CN VII: (1) proximal to geniculate -> dry eye + hyperacusis + loss of anterior 2/3 taste + facial palsy; (2) between stapedius & chorda -> loss of taste + facial palsy (normal tearing & hearing); (3) distal to stylomastoid foramen -> pure motor facial palsy!',
    quizClue:
      'Cranial nerve trunk running horizontally behind the medial wall above the oval window before bending at the second genu to descend vertically behind the posterior wall.',
    quizHint: 'Turn on X-Ray walls [X] and look at the thick golden nerve trunk curving above the Oval Window and descending behind the Posterior Wall.'
  },

  geniculate_ganglion_gpn: {
    id: 'geniculate_ganglion_gpn',
    name: 'Geniculate Ganglion & Greater Petrosal Nerve (CN VII)',
    shortName: 'Geniculate Ganglion & Greater Petrosal N.',
    aka: '1st Genu of CN VII & Nervus Petrosus Major (Lacrimation Pathway)',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Anterosuperior Medial Petrous Bone (Near Processus Cochleariformis)',
    tier: 3,
    aliases: [
      'geniculate ganglion',
      'greater petrosal nerve',
      'greater superficial petrosal nerve',
      'geniculate ganglion and greater petrosal nerve',
      'first genu of facial nerve'
    ],
    boxColor: 0xf59e0b,
    tissueColor: 0xf59e0b,
    summary:
      'Sharp hairpin knee-bend (1st Genu) of CN VII housing pseudounipolar taste cell bodies (Geniculate Ganglion) and giving off the anteriorly directed Greater Petrosal Nerve along the petrous roof.',
    relations:
      'Located just superomedial to Processus Cochleariformis! Greater Petrosal Nerve joins the Deep Petrosal Nerve (from ICA sympathetic plexus) to form the Nerve of the Pterygoid Canal (Vidian nerve) -> Pterygopalatine Ganglion.',
    supply: 'Preganglionic parasympathetic secretomotor to Lacrimal, Nasal & Palatine glands + taste cell bodies for Chorda Tympani.',
    clinicalPearl:
      'Reactivation of latent Varicella-Zoster Virus (VZV) inside the Geniculate Ganglion causes RAMSAY HUNT SYNDROME (Herpes Zoster Oticus): painful vesicles in the ear canal/concha + ipsilateral facial paralysis + loss of taste/hyperacusis!',
    quizClue:
      'Sensory ganglion at the sharp anterior first genu of CN VII (site of VZV reactivation in Ramsay Hunt syndrome) giving off the preganglionic parasympathetic nerve for lacrimation.',
    quizHint: 'Turn on X-Ray walls [X] and follow CN VII anteriorly above the Promontory to its bulbous anterior knee-bend and forward-pointing branch.'
  },

  chorda_tympani: {
    id: 'chorda_tympani',
    name: 'Chorda Tympani Nerve (Branch of CN VII)',
    shortName: 'Chorda Tympani',
    aka: 'Recurrent Taste & Salivatory Branch of CN VII Traversing Tympanic Cavity',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Posterior Canaliculus -> Medial to Malleus / Lateral to Incus -> Petrotympanic Fissure',
    tier: 1,
    aliases: ['chorda tympani', 'chorda tympani nerve'],
    boxColor: 0xfde047,
    tissueColor: 0xfacc15,
    summary:
      'Slender recurrent branch of CN VII arising from its vertical mastoid segment, entering the posterior middle ear, arching forward draped in mucosa right across the upper tympanic membrane, and exiting via the Petrotympanic (Glaserian) Fissure to hitchhike on the Lingual Nerve (CN V3).',
    relations:
      'CLASSIC EXAM RELATION: Passes MEDIAL to the Neck of the Malleus and LATERAL to the Long Limb of the Incus!',
    supply:
      '(1) Special Visceral Afferent taste from anterior 2/3 of tongue; (2) Preganglionic parasympathetic fibers to Submandibular Ganglion (submandibular & sublingual salivary glands).',
    clinicalPearl:
      'Stretching or severing the exposed chorda tympani during middle-ear surgery or chronic perforation causes ipsilateral metallic dysgeusia / ageusia on the anterior 2/3 of the tongue + decreased submandibular salivation, WITHOUT facial motor weakness!',
    quizClue:
      'Branch of CN VII carrying taste from the anterior 2/3 of the tongue that arches bare across the tympanic cavity MEDIAL to the malleus neck and LATERAL to the incus long limb.',
    quizHint: 'Look up between the Malleus neck and Incus long limb for the golden nerve wire threading right between the two ossicles.'
  },

  tympanic_plexus: {
    id: 'tympanic_plexus',
    name: 'Tympanic Plexus & Jacobson’s Nerve (CN IX)',
    shortName: 'Tympanic Plexus (Jacobson’s, CN IX)',
    aka: 'Tympanic Branch of Glossopharyngeal Nerve (CN IX) on Promontory',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Floor (Tympanic Canaliculus) -> Promontory Surface',
    tier: 2,
    aliases: [
      'tympanic plexus',
      'jacobson nerve',
      'jacobsons nerve',
      'tympanic nerve',
      'tympanic branch of glossopharyngeal nerve',
      'tympanic branch of cn ix'
    ],
    boxColor: 0xfef08a,
    tissueColor: 0xfde047,
    summary:
      'Branching sub-mucosal nerve arborization grooving the surface of the Promontory, formed primarily by Jacobson’s Nerve (tympanic branch of CN IX) ascending through the Tympanic Canaliculus in the Floor.',
    relations:
      'Supplies general visceral/somatic sensation to the entire middle-ear mucosa, medial eardrum, mastoid air cells, and Eustachian tube.',
    supply: 'Glossopharyngeal Nerve (CN IX — 3rd Pharyngeal Arch).',
    clinicalPearl:
      'Explains REFERRED OTALGIA (earache with a normal otoscopic exam!): tonsillitis, peritonsillar abscess, or squamous cell carcinoma of the base of tongue/tonsillar fossa irritates CN IX, referring sharp pain directly to the middle ear via Jacobson’s nerve!',
    quizClue:
      'Sensory and parasympathetic nerve network grooving the surface of the promontory, arising from CN IX through the floor and explaining referred earache from tonsillitis.',
    quizHint: 'Look at the golden nerve climbing up through the Floor onto the central dome of the Promontory.'
  },

  lesser_petrosal_nerve: {
    id: 'lesser_petrosal_nerve',
    name: 'Lesser Petrosal Nerve (CN IX -> Otic Ganglion)',
    shortName: 'Lesser Petrosal Nerve (CN IX)',
    aka: 'Nervus Petrosus Minor (Parotid Secretomotor Relay)',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Superior Promontory -> Piercing Tegmen Tympani Roof',
    tier: 3,
    aliases: ['lesser petrosal nerve', 'lesser superficial petrosal nerve', 'nervus petrosus minor'],
    boxColor: 0xfde047,
    tissueColor: 0xfef08a,
    summary:
      'Slender superior continuation of the preganglionic parasympathetic fibers of Jacobson’s nerve / Tympanic Plexus ascending from the upper Promontory to pierce the Tegmen Tympani roof into the middle cranial fossa.',
    relations:
      'Exits the skull through Foramen Ovale to synapse in the OTIC GANGLION, whose postganglionic fibers hitchhike on the Auriculotemporal Nerve (CN V3) to the Parotid Gland!',
    supply: 'Preganglionic parasympathetic secretomotor from Inferior Salivatory Nucleus (CN IX).',
    clinicalPearl:
      'USMLE high-yield petrosal contrast: GREATER Petrosal Nerve = CN VII -> Pterygopalatine Ganglion -> Lacrimal/Nasal glands; LESSER Petrosal Nerve = CN IX (via Tympanic Plexus) -> Otic Ganglion -> PAROTID gland!',
    quizClue:
      'Nerve reforming from the superior pole of the tympanic plexus and piercing upward through the tegmen tympani roof to carry CN IX parasympathetic fibers to the otic ganglion for the parotid gland.',
    quizHint: 'Follow the Tympanic Plexus upward from the top of the Promontory to the slender golden branch piercing straight UP through the Roof.'
  },

  caroticotympanic_nerves: {
    id: 'caroticotympanic_nerves',
    name: 'Caroticotympanic Nerves & Internal Carotid Sympathetic Plexus',
    shortName: 'Caroticotympanic Nerves (Sympathetic)',
    aka: 'Postganglionic Sympathetic Fibers from Superior Cervical Ganglion',
    category: CATEGORIES.NEUROMUSCULAR,
    wall: 'Peri-Carotid Plexus -> Piercing Anterior Wall -> Promontory',
    tier: 3,
    aliases: [
      'caroticotympanic nerves',
      'caroticotympanic nerve',
      'internal carotid plexus',
      'carotid sympathetic plexus',
      'sympathetic carotid plexus'
    ],
    boxColor: 0xfef08a,
    tissueColor: 0xfde047,
    summary:
      'Postganglionic sympathetic nerve network spiraling around the petrous Internal Carotid Artery (arising from the Superior Cervical Ganglion) and sending slender Caroticotympanic twigs backward through the thin Anterior Wall to join the Tympanic Plexus.',
    relations:
      'Accompanied through the lower carotid wall by small caroticotympanic arterial twigs.',
    supply: 'Postganglionic sympathetic vasomotor fibers (T1–T2 -> Superior Cervical Ganglion).',
    clinicalPearl:
      'Lesions or carotid dissection injuring this peri-arterial Internal Carotid Sympathetic Plexus in the carotid canal produce ipsilateral HORNER SYNDROME (ptosis, miosis) WITHOUT facial anhidrosis (since sweat fibers already branched off along the external carotid)!',
    quizClue:
      'Postganglionic sympathetic nerve web wrapping the petrous internal carotid artery and piercing the anterior wall to join the tympanic plexus (injury causes Horner syndrome without anhidrosis).',
    quizHint: 'Look at the golden nerve twig piercing backward from the red Internal Carotid Artery through the lower Anterior Wall onto the Promontory (turn on X-Ray [X] to see the full spiral around the ICA).'
  },

  // =========================================================================
  // 6. SURROUNDING INNER EAR, OUTER EAR, VASCULAR & INTRACRANIAL NEIGHBORS (10)
  // =========================================================================
  cochlea: {
    id: 'cochlea',
    name: 'Cochlea (Bony Snail Shell of Inner Ear)',
    shortName: 'Cochlea',
    aka: '2.65-Turn Auditory Spiral Around Modiolus',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Medial & Anterior to Medial Wall',
    tier: 1,
    parentGroup: 'inner_ear_labyrinth',
    parentName: 'Inner Ear Labyrinth',
    aliases: ['cochlea', 'bony cochlea', 'cochlear spiral'],
    boxColor: 0xa855f7,
    tissueColor: 0xc4b59d,
    summary:
      'Tightly coiled ~2.65-turn conical snail-shell bony tube winding around a central bony core (Modiolus), divided internally into Scala Vestibuli (perilymph, from Oval Window), Scala Media / Cochlear Duct (endolymph + Organ of Corti), and Scala Tympani (perilymph, ending at Round Window).',
    relations:
      'Its broad first (basal) turn presses laterally against the middle ear to form the Promontory!',
    supply: 'Labyrinthine artery (branch of AICA); Spiral Ganglion -> Cochlear division of CN VIII.',
    clinicalPearl:
      'Tonotopic map: stiff, narrow BASAL membrane near the Oval/Round windows resonates to HIGH frequencies (20,000 Hz, lost first in presbycusis & aminoglycoside ototoxicity); wide, floppy APEX (helicotrema) resonates to LOW frequencies (20 Hz)!',
    quizClue:
      '2.65-turn snail-shaped auditory organ behind the medial wall whose wide basal turn forms the promontory and encodes high-frequency sound.',
    quizHint: 'Turn on X-Ray walls [X] and look behind the anterior/central Medial Wall for the coiled purple snail shell.'
  },

  vestibule_inner_ear: {
    id: 'vestibule_inner_ear',
    name: 'Vestibule of Bony Labyrinth (Utricle & Saccule Chamber)',
    shortName: 'Vestibule (Inner Ear)',
    aka: 'Central Chamber of Bony Labyrinth Medial to Oval Window',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Directly Medial to Oval Window',
    tier: 3,
    parentGroup: 'inner_ear_labyrinth',
    parentName: 'Inner Ear Labyrinth',
    aliases: ['vestibule', 'vestibule of inner ear', 'vestibule of bony labyrinth', 'bony vestibule'],
    boxColor: 0xc084fc,
    tissueColor: 0xcabaa3,
    summary:
      'Ovoid central perilymphatic chamber (~5 mm) of the bony labyrinth situated between the Cochlea anteriorly and the three Semicircular Canals posteriorly, housing the membranous Utricle and Saccule (otolith organs).',
    relations:
      'Its lateral wall opens directly into the middle ear at the Oval Window (sealed by the Stapes Footplate)!',
    supply: 'Vestibular division of CN VIII (utricular & saccular maculae).',
    clinicalPearl:
      'Detects LINEAR acceleration and head tilt relative to gravity via calcium-carbonate otoconia crystals (dislodged otoconia drifting from the Utricle into the Posterior Semicircular Canal cause BPPV!).',
    quizClue:
      'Central chamber of the bony labyrinth located directly medial to the oval window and between the cochlea and semicircular canals, housing the utricle and saccule.',
    quizHint: 'Turn on X-Ray walls [X] and look directly behind the Oval Window between the snail Cochlea and the Semicircular Canal loops.'
  },

  semicircular_canals: {
    id: 'semicircular_canals',
    name: 'Semicircular Canals, Osseous Ampullae & Crus Commune',
    shortName: 'Semicircular Canals & Ampullae',
    aka: 'Lateral, Superior & Posterior Canals (Angular Acceleration)',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Posterosuperior & Medial to Medial Wall',
    tier: 2,
    parentGroup: 'inner_ear_labyrinth',
    parentName: 'Inner Ear Labyrinth',
    aliases: [
      'semicircular canals',
      'semicircular canal',
      'three semicircular canals',
      'semicircular ducts',
      'ampullae of semicircular canals'
    ],
    boxColor: 0xd8b4fe,
    tissueColor: 0xc8b8a0,
    summary:
      'Three mutually orthogonal C-shaped bony loops (Lateral/Horizontal, Superior/Anterior, and Posterior) opening into the Vestibule via five orifices (Superior & Posterior non-ampullated ends unite as the shared Crus Commune!), each featuring one bulbous Osseous Ampulla housing a crista ampullaris.',
    relations:
      'Lateral canal presses against the medial/aditus wall right above CN VII; Superior canal forms the arcuate eminence on the petrous ridge.',
    supply: 'Vestibular division of CN VIII.',
    clinicalPearl:
      'Sense ANGULAR (rotational) head acceleration in 3D space! In Benign Paroxysmal Positional Vertigo (BPPV), otoconia fall most commonly into the dependent POSTERIOR Semicircular Canal (treated with the Epley maneuver).',
    quizClue:
      'Three orthogonal balance loops with bulbous ampullated ends behind the posterosuperior medial wall that detect angular head acceleration.',
    quizHint: 'Turn on X-Ray walls [X] and look behind the posterosuperior Medial Wall for the three orthogonal C-shaped purple canal loops.'
  },

  vestibulocochlear_nerve_cn8: {
    id: 'vestibulocochlear_nerve_cn8',
    name: 'Vestibulocochlear Nerve (CN VIII — Cochlear & Vestibular Divisions)',
    shortName: 'Vestibulocochlear Nerve (CN VIII)',
    aka: 'Cranial Nerve VIII Entering Internal Acoustic Meatus',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Medial to Cochlea & Vestibule (-> Internal Acoustic Meatus)',
    tier: 2,
    parentGroup: 'inner_ear_labyrinth',
    parentName: 'Inner Ear Labyrinth',
    aliases: [
      'vestibulocochlear nerve',
      'cn viii',
      'cn 8',
      'cranial nerve 8',
      'cranial nerve viii',
      'auditory vestibular nerve',
      'acoustic nerve'
    ],
    boxColor: 0xfacc15,
    tissueColor: 0xfde047,
    summary:
      'Special sensory Cranial Nerve VIII formed by the union of the Cochlear Nerve (from the modiolus base of the Cochlea) and the Vestibular Nerve (from the Vestibule & Ampullae), traveling medially alongside CN VII through the Internal Acoustic Meatus to the cerebellopontine angle.',
    relations:
      'Accompanied in the internal acoustic meatus by CN VII and the Labyrinthine Artery.',
    supply: 'Special Somatic Afferent (hearing & equilibrium).',
    clinicalPearl:
      'A VESTIBULAR SCHWANNOMA (acoustic neuroma — bilateral in NF2!) arises from Schwann cells on the vestibular division of CN VIII at the internal acoustic meatus / CPA, causing progressive unilateral sensorineural hearing loss, tinnitus, disequilibrium, and later CN VII/V compression!',
    quizClue:
      'Bifurcated cranial nerve uniting cochlear and vestibular trunks medial to the bony labyrinth (site of vestibular schwannoma / acoustic neuroma).',
    quizHint: 'Turn on X-Ray walls [X] (or Preset 6/7) and look far medially (-Z) behind the Cochlea and Vestibule for the bifurcated golden nerve trunk.'
  },

  auricle_pinna: {
    id: 'auricle_pinna',
    name: 'Auricle (Pinna — Helix, Antihelix, Concha, Tragus & Lobule)',
    shortName: 'Auricle (Pinna)',
    aka: 'External Sound-Collecting Elastic Cartilage & Earlobe',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Lateral End of External Ear',
    tier: 1,
    parentGroup: 'external_ear',
    parentName: 'External Ear',
    aliases: ['auricle', 'pinna', 'external pinna', 'outer pinna'],
    boxColor: 0x34d399,
    tissueColor: 0xdc9d82,
    summary:
      'Sculpted single plate of yellow elastic cartilage covered tightly by perichondrium and skin — featuring the curled outer Helix, inner Antihelix, deep Concha bowl funneling sound into the meatus, protective anterior Tragus, and non-cartilaginous fibrofatty inferior Lobule.',
    relations:
      'Derived from six mesenchymal auricular hillocks of His around the 1st and 2nd Pharyngeal Arches.',
    supply: 'Great Auricular (C2–C3), Auriculotemporal (CN V3), Lesser Occipital (C2), and CN VII/X in concha.',
    clinicalPearl:
      'Blunt trauma shearing skin from perichondrium causes an AURICULAR HEMATOMA — if not promptly drained and bolstered, avascular cartilage necrosis produces permanent "cauliflower ear"!',
    quizClue:
      'Elastic-cartilage outer structure (helix, antihelix, concha, tragus, and fibrofatty lobule) derived from the 1st and 2nd pharyngeal arch hillocks that collects and localizes airborne sound.',
    quizHint: 'Look at the far lateral (+Z) exterior end of the ear canal (use Preset 6/7 or X-Ray [X]).'
  },

  external_acoustic_meatus: {
    id: 'external_acoustic_meatus',
    name: 'External Acoustic Meatus (External Auditory Canal)',
    shortName: 'External Acoustic Meatus (Canal)',
    aka: 'Lateral 1/3 Cartilaginous + Medial 2/3 Osseous Ear Canal (~2.5 cm)',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Lateral to Tympanic Membrane',
    tier: 2,
    parentGroup: 'external_ear',
    parentName: 'External Ear',
    aliases: [
      'external acoustic meatus',
      'external auditory canal',
      'external auditory meatus',
      'ear canal',
      'auditory canal'
    ],
    boxColor: 0x6ee7b7,
    tissueColor: 0xe2a98f,
    summary:
      '~2.5 cm S-curved skin-lined tube extending from the concha of the Pinna to the Tympanic Membrane: lateral 1/3 is fibrocartilaginous (containing hair follicles, sebaceous & ceruminous earwax glands), medial 2/3 is thin skin tightly adherent to temporal bone.',
    relations:
      'Derived from the 1st Pharyngeal Cleft (Groove)! Anterior wall borders the Temporomandibular Joint (TMJ).',
    supply:
      'Anterior/superior wall: Auriculotemporal (CN V3). Posterior/inferior wall: Auricular branch of Vagus (CN X — Arnold’s nerve!).',
    clinicalPearl:
      'Stimulating the posterior-inferior ear canal wall with a cotton swab or speculum triggers an involuntary COUGH (or gag/bradycardia) via ARNOLD’S NERVE (auricular branch of Vagus, CN X)! Straighten in adults by pulling pinna UP & BACK.',
    quizClue:
      'S-shaped ~2.5 cm canal (1st pharyngeal cleft derivative; lateral 1/3 cartilaginous, medial 2/3 bony) whose floor is supplied by Arnold’s branch of CN X (ear-cough reflex).',
    quizHint: 'Look immediately lateral (+Z) to the Tympanic Membrane at the S-curved tube leading from the Pinna to the eardrum.'
  },

  temporal_lobe: {
    id: 'temporal_lobe',
    name: 'Temporal Lobe of Cerebrum (Middle Cranial Fossa)',
    shortName: 'Temporal Lobe (Brain)',
    aka: 'Inferior Temporal Cortical Gyri Superior to Tegmen Tympani',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Superior to Roof (Tegmen Tympani)',
    tier: 2,
    parentGroup: 'middle_cranial_fossa',
    parentName: 'Middle Cranial Fossa',
    aliases: ['temporal lobe', 'temporal lobe of brain', 'temporal cortex', 'temporal gyri', 'cerebral cortex'],
    boxColor: 0xf472b6,
    tissueColor: 0xebb0c0,
    summary:
      'Inferior cortical gyri of the Temporal Lobe resting in the Middle Cranial Fossa immediately above the dura mater and paper-thin Tegmen Tympani roof of the middle ear and mastoid antrum.',
    relations:
      'Separated from middle-ear pus during acute otitis media by <1 mm of tegmen bone and dura.',
    supply: 'Middle & Posterior Cerebral Arteries; drains via Inferior Anastomotic Vein of Labbé into Transverse Sinus.',
    clinicalPearl:
      'Otogenic brain abscesses from chronic suppurative otitis media / cholesteatoma occur in TWO classic locations: SUPERIOR erosion through Tegmen Tympani -> TEMPORAL LOBE abscess; POSTERIOR erosion through mastoid -> CEREBELLAR abscess!',
    quizClue:
      'Cerebral lobe resting in the middle cranial fossa directly above the tegmen tympani roof (classic site of otogenic brain abscess from upward roof erosion).',
    quizHint: 'Turn on X-Ray walls [X] and look ABOVE the Roof (+Y) at the folded pink cortical gyri.'
  },

  dura_middle_meningeal: {
    id: 'dura_middle_meningeal',
    name: 'Dura Mater & Middle Meningeal Artery (Floor of Middle Cranial Fossa)',
    shortName: 'Dura Mater & Middle Meningeal A.',
    aka: 'Meningeal Floor Above Tegmen Tympani',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Immediately Superior to Tegmen Tympani Roof',
    tier: 3,
    parentGroup: 'middle_cranial_fossa',
    parentName: 'Middle Cranial Fossa',
    aliases: ['dura mater', 'middle meningeal artery', 'dura mater and middle meningeal artery', 'middle cranial fossa dura'],
    boxColor: 0x93c5fd,
    tissueColor: 0x93c5fd,
    summary:
      'Tough periosteal/meningeal Dura Mater lining the superior surface of the Tegmen Tympani in the Middle Cranial Fossa, carrying branches of the Middle Meningeal Artery (from maxillary artery via foramen spinosum).',
    relations:
      'Directly adherent to the superior surface of Tegmen Tympani; breached in tegmen defects causing CSF otorrhea or encephalocele.',
    supply: 'Meningeal branches of CN V3; Middle Meningeal Artery.',
    clinicalPearl:
      'Fracture of the adjacent thin squamous temporal bone (pterion) lacerates the Middle Meningeal Artery -> lens-shaped biconvex EPIDURAL HEMATOMA; tegmen fracture tearing the dura leaks clear CSF out the ear (CSF otorrhea)!',
    quizClue:
      'Tough meningeal sheet and accompanying arterial branch lying directly on the superior surface of the tegmen tympani roof (tear causes CSF otorrhea).',
    quizHint: 'Turn on X-Ray walls [X] and look just above the green Roof slab (beneath the pink brain gyri) for the translucent blue dural sheet and red meningeal artery.'
  },

  internal_jugular_vein: {
    id: 'internal_jugular_vein',
    name: 'Sigmoid Sinus & Superior Bulb of Internal Jugular Vein',
    shortName: 'Internal Jugular Vein (Jugular Bulb)',
    aka: 'Bulbus Superior Venae Jugularis',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Inferior to Floor (Jugular Wall)',
    tier: 1,
    aliases: [
      'internal jugular vein',
      'jugular bulb',
      'superior jugular bulb',
      'superior bulb of internal jugular vein',
      'ijv',
      'sigmoid sinus'
    ],
    boxColor: 0x2563eb,
    tissueColor: 0x1d4ed8,
    summary:
      'Continuous venous conduit curving from the Sigmoid Dural Venous Sinus behind the mastoid up into the dilated dome of the Superior Jugular Bulb directly beneath the thin Floor (Jugular Wall), before descending into the neck as the Internal Jugular Vein.',
    relations:
      'Exits through the Jugular Foramen alongside CN IX, X, and XI.',
    supply: 'Drains cerebral venous blood toward brachiocephalic vein.',
    clinicalPearl:
      'A congenitally dehiscent "high-riding jugular bulb" protrudes uncovered into the lower middle ear as a smooth dark-blue mass behind the posteroinferior eardrum — myringotomy there causes profuse venous bleeding!',
    quizClue:
      'Large blue dilated venous bulb located immediately beneath the thin bony floor (jugular wall) of the tympanic cavity.',
    quizHint: 'Turn on X-Ray walls [X] and look directly BELOW the Floor (-Y) for the large blue vein.'
  },

  internal_carotid_artery: {
    id: 'internal_carotid_artery',
    name: 'Internal Carotid Artery (Petrous Segment in Carotid Canal)',
    shortName: 'Internal Carotid Artery (ICA)',
    aka: 'Pars Petrosa Arteriae Carotidis Internae',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Anterior to Anterior (Carotid) Wall',
    tier: 1,
    aliases: ['internal carotid artery', 'petrous internal carotid artery', 'carotid artery', 'ica'],
    boxColor: 0xdc2626,
    tissueColor: 0xb91c1c,
    summary:
      'Large petrous segment of the Internal Carotid Artery ascending vertically from the neck into the Carotid Canal of the temporal bone and bending 90° anteromedially right in front of the thin lower Anterior Wall.',
    relations:
      'Surrounded by the sympathetic Internal Carotid Plexus and venous plexus; lies inferomedial to the Eustachian tube.',
    supply: 'Supplies anterior cerebral circulation (ophthalmic, ACA, MCA).',
    clinicalPearl:
      'Unforgettable spatial pair: BLUE Vein (Jugular Bulb) sits under the FLOOR, while RED Artery (Internal Carotid) curves right outside the ANTERIOR wall!',
    quizClue:
      'Major cerebral artery ascending vertically and bending 90 degrees anteromedially inside the temporal-bone canal immediately outside the lower anterior wall.',
    quizHint: 'Turn on X-Ray walls [X] and look right outside the blue Anterior Wall for the thick curving red artery.'
  },

  mastoid_air_cells: {
    id: 'mastoid_air_cells',
    name: 'Mastoid Antrum & Trabecular Mastoid Air Cells',
    shortName: 'Mastoid Antrum & Air Cells',
    aka: 'Antrum Mastoideum & Cellulae Mastoideae',
    category: CATEGORIES.NEIGHBORS,
    wall: 'Posterior to Posterior (Mastoid) Wall',
    tier: 1,
    aliases: ['mastoid air cells', 'mastoid antrum', 'mastoid antrum and air cells', 'antrum', 'mastoid cells'],
    boxColor: 0xd97706,
    tissueColor: 0xc2a887,
    summary:
      'Central mucoperiosteal-lined sinus (Mastoid Antrum) behind the Aditus surrounded by an interconnected honeycomb of pneumatized cavities (Mastoid Air Cells) excavating the mastoid process.',
    relations:
      'Roofed by Tegmen Tympani; posteromedially borders the Sigmoid Venous Sinus and cerebellum; anteromedially borders vertical CN VII.',
    supply: 'Pneumatizes progressively after birth as Sternocleidomastoid pull develops the mastoid tip.',
    clinicalPearl:
      'Untreated coalescent mastoiditis destroying bony trabeculae can erode posteromedially into the Sigmoid Sinus (septic thrombophlebitis / "picket-fence" fevers) or inferiorly through the medial mastoid tip into the SCM sheath (Bezold abscess)!',
    quizClue:
      'Pneumatized sinus and honeycomb air spaces behind the posterior wall communicating with the epitympanic recess through the aditus.',
    quizHint: 'Look or fly backward through the Aditus archway in the upper Posterior Wall.'
  }
};

export const STRUCTURE_LIST = Object.values(ANATOMY_DATA);

// Legacy / group mapping so Guided Lesson steps or group references expand cleanly to all constituent sub-parts
const GROUP_TO_PRIMARY_ID = {
  malleus: 'malleus_manubrium',
  incus: 'incus_body',
  stapes: 'stapes_footplate',
  tympanic_membrane: 'tm_pars_tensa',
  inner_ear_labyrinth: 'cochlea',
  external_ear: 'external_acoustic_meatus',
  middle_cranial_fossa: 'temporal_lobe',
  tensor_tympani: 'tensor_tympani_muscle'
};

export function resolvePrimaryStructureId(idOrGroup) {
  if (ANATOMY_DATA[idOrGroup]) return idOrGroup;
  return GROUP_TO_PRIMARY_ID[idOrGroup] || idOrGroup;
}

export function expandStructureGroupIds(ids = []) {
  const out = new Set();
  ids.forEach((rawId) => {
    if (ANATOMY_DATA[rawId]) {
      out.add(rawId);
    }
    // Also include all sub-parts belonging to this parentGroup!
    STRUCTURE_LIST.forEach((s) => {
      if (s.parentGroup === rawId) {
        out.add(s.id);
      }
    });
  });
  return Array.from(out);
}
