// Structured 7-Chapter Guided 3D Curriculum for the Middle Ear Room Diorama
// Combines choreographed camera glides, live biomechanics, spatial memory hooks, and 3D active-recall checkpoints.

export const LESSON_CHAPTERS = [
  { id: 'ch1', number: 1, shortTitle: '1. Overview & Attic', title: 'The Big Picture & Two Stories' },
  { id: 'ch2', number: 2, shortTitle: '2. Roof, Floor & Ant.', title: 'Brain Above, Vein Below, Artery Ahead' },
  { id: 'ch3', number: 3, shortTitle: '3. Lateral & Post.', title: 'The Conical Drum & Mastoid Doorway' },
  { id: 'ch4', number: 4, shortTitle: '4. Medial Wall', title: 'The Labyrinthine Wall & Two Windows' },
  { id: 'ch5', number: 5, shortTitle: '5. Ossicles & Sound', title: 'Impedance Matching & Sound Mechanics' },
  { id: 'ch6', number: 6, shortTitle: '6. Muscles & Reflex', title: 'Anterior Pulley vs. Posterior Pyramid' },
  { id: 'ch7', number: 7, shortTitle: '7. Nerve Crossroads', title: 'CN VII, Chorda Tympani & Jacobson’s Plexus' }
];

export const LESSON_STEPS = [
  // =========================================================================
  // CHAPTER 1: THE BIG PICTURE & TWO STORIES
  // =========================================================================
  {
    id: 'step_1_1',
    chapterId: 'ch1',
    type: 'teach',
    title: 'Why the Middle Ear Exists: The 99.9% Reflection Problem',
    body:
      'Look across the three parts of the ear from lateral to medial: the air-filled Outer Ear funnels sound waves onto the Tympanic Membrane, the air-filled Middle Ear bridges the gap via three tiny bones, and the fluid-filled Inner Ear (Cochlea) converts fluid waves into nerve signals.',
    memoryHook:
      'Why not hit cochlear fluid directly with air waves? Water has much higher acoustic impedance than air — without the middle ear’s mechanical transformer, 99.9% of sound energy would bounce right off and only 0.1% would enter!',
    focusIds: ['external_ear', 'tympanic_membrane', 'malleus', 'stapes', 'inner_ear_labyrinth'],
    sceneState: { xrayMode: 1, ossicleMode: 0, doorOpen: false, soundMode: 'normal' },
    camera: (sx) => ({
      pos: [sx * 26.5, 11.5, 4.5],
      lookAt: [sx * -0.5, 1.0, 1.5],
      noclip: true
    })
  },

  {
    id: 'step_1_2',
    chapterId: 'ch1',
    type: 'teach',
    title: 'Shrinking Inside: A Two-Story Room (Tympanum vs. Attic)',
    body:
      'Welcome inside the middle ear! Notice the glowing green dashed cornice line running around the upper walls. Anatomists divide this air-filled room in the temporal bone into two vertical stories: (1) the Tympanic Cavity Proper (directly medial to the eardrum) and (2) the Epitympanic Recess ("Attic") above the level of the eardrum.',
    memoryHook:
      'Picture a house with an attic: the Head of the Malleus and Body of the Incus reach UP into the Epitympanic Recess (Attic), which opens backward into the mastoid air cells!',
    focusIds: ['epitympanic_recess', 'malleus', 'incus'],
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * -1.4, 2.0, 5.15],
      lookAt: [sx * -0.2, 4.4, -3.5],
      noclip: false
    })
  },

  // =========================================================================
  // CHAPTER 2: ROOF, FLOOR & ANTERIOR VASCULAR WALLS
  // =========================================================================
  {
    id: 'step_2_1',
    chapterId: 'ch2',
    type: 'teach',
    title: 'Ceiling & Floor: Brain Above, Jugular Vein Below',
    body:
      'With X-Ray walls active, look up and down. The ceiling (Roof / Tegmental Wall) is a paper-thin shelf of petrous temporal bone called the Tegmen Tympani — resting right on top of it are the Dura Mater and Temporal Lobe in the Middle Cranial Fossa. Directly beneath the thin bony Floor (Jugular Wall) arches the blue Superior Bulb of the Internal Jugular Vein.',
    memoryHook:
      'Clinical link that sticks: Infections eroding UP through the Tegmen Tympani cause meningitis or temporal-lobe abscess; glomus jugulare tumors eroding UP through the Floor appear as a pulsatile blue-red mass behind the lower eardrum!',
    focusIds: ['tegmen_tympani', 'middle_cranial_fossa', 'jugular_wall', 'internal_jugular_vein'],
    sceneState: { xrayMode: 1, ossicleMode: 1, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * -4.2, 1.8, 3.8],
      lookAt: [sx * 0.8, 1.8, -2.5],
      noclip: false
    })
  },

  {
    id: 'step_2_2',
    chapterId: 'ch2',
    type: 'teach',
    title: 'Anterior (Carotid) Wall: Red Artery + Two Parallel Tunnels',
    body:
      'Now face the blue Anterior Wall. Its lower half is a thin bony plate separating the room from the crimson Internal Carotid Artery curving forward in the carotid canal (pierced by tiny caroticotympanic nerves and a tympanic arterial branch). Stacked above the artery are two openings: the Tensor Tympani Semicanal on top, and the larger Auditory (Eustachian) Tube below.',
    memoryHook:
      'Unforgettable Vascular Rule: BLUE Vein (Internal Jugular) under the FLOOR, RED Artery (Internal Carotid) outside the ANTERIOR wall! And above the artery: Muscle canal on TOP, Nasopharynx pressure-equalizing tube on BOTTOM.',
    focusIds: ['anterior_wall', 'internal_carotid_artery', 'tensor_tympani_semicanal', 'eustachian_tube'],
    sceneState: { xrayMode: 1, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * -1.8, 1.5, 2.2],
      lookAt: [sx * 8.0, 0.8, -2.8],
      noclip: false
    })
  },

  {
    id: 'step_2_cp',
    chapterId: 'ch2',
    type: 'checkpoint',
    title: 'Checkpoint 1 of 6 — Anterior & Vascular Boundaries',
    prompt:
      'Swallowing or yawning opens a funnel-like channel to equalize middle-ear pressure (and in infants it is shorter and more horizontal, predisposing to otitis media). Aim your crosshair and Left-Click that structure in 3D!',
    targetId: 'eustachian_tube',
    hint: 'Look at the lower-middle opening on the blue Anterior Wall, right below the tensor tympani muscle canal.',
    successNote:
      'Spot on! The Auditory (Pharyngotympanic / Eustachian) Tube sits on the Anterior Wall inferior to the tensor tympani semicanal and superior/posterior to the internal carotid artery.',
    sceneState: { xrayMode: 1, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * -1.8, 1.6, 2.4],
      lookAt: [sx * 7.8, 1.0, -2.6],
      noclip: false
    })
  },

  // =========================================================================
  // CHAPTER 3: LATERAL & POSTERIOR WALLS
  // =========================================================================
  {
    id: 'step_3_1',
    chapterId: 'ch3',
    type: 'teach',
    title: 'Lateral (Membranous) Wall: Inward-Peaking Cone & Scutum',
    body:
      'Turn around to inspect the Lateral Wall. Notice how the Tympanic Membrane isn’t flat — it tents medially into the room like a loudspeaker cone, peaking at the Umbo where the tip of the malleus handle embeds! A white horseshoe fibrocartilaginous ring frames the taut lower Pars Tensa, leaving a small superior gap (Rivinus notch) for the lax Pars Flaccida just beneath the upper bony attic wall (Scutum).',
    memoryHook:
      'Otoscopy & CT pearl: The conical eardrum points INWARD toward the middle ear (umbo = deepest point). Above it, sharp bony Scutum erosion on CT is the classic sign of a pars-flaccida cholesteatoma!',
    focusIds: ['tympanic_membrane', 'lateral_wall_scutum', 'malleus'],
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * -3.6, 1.8, -2.6],
      lookAt: [sx * 0.4, 1.6, 5.2],
      noclip: false
    })
  },

  {
    id: 'step_3_2',
    chapterId: 'ch3',
    type: 'teach',
    title: 'Posterior (Mastoid) Wall: Aditus Doorway & Hollow Pyramid',
    body:
      'Now face the golden Posterior Wall. High up in the attic sits a real open archway — the Aditus to Mastoid Antrum — leading directly backward into the Mastoid Antrum and honeycomb Mastoid Air Cells! Just below the aditus sits the cup-like Fossa Incudis (anchoring the short limb of the incus) and a pointed volcano-like cone: the Pyramidal Eminence, perforated at its tip by the stapedius tendon.',
    memoryHook:
      'Think of the Posterior Wall from top to bottom: ADITUS doorway on top (how otitis media spreads into mastoiditis!) → Short limb of Incus in Fossa Incudis → Pointed PYRAMID shooting the stapedius tendon forward!',
    focusIds: ['posterior_wall', 'aditus_to_antrum', 'mastoid_air_cells', 'pyramidal_eminence'],
    sceneState: { xrayMode: 1, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 2.6, 3.2, 1.4],
      lookAt: [sx * -8.0, 3.6, -1.5],
      noclip: false
    })
  },

  {
    id: 'step_3_cp',
    chapterId: 'ch3',
    type: 'checkpoint',
    title: 'Checkpoint 2 of 6 — Posterior Wall Landmarks',
    prompt:
      'Untreated middle-ear infection can pass backward from the epitympanic recess into the mastoid air cells through a superior archway in the Posterior Wall. Fly/aim your crosshair and Left-Click that archway!',
    targetId: 'aditus_to_antrum',
    hint: 'Look high up on the golden Posterior Wall for the arched doorway frame opening into the mastoid chamber.',
    successNote:
      'Nailed it! The Aditus to Mastoid Antrum connects the epitympanic recess anteriorly with the mastoid antrum and air cells posteriorly.',
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 2.4, 3.4, 1.4],
      lookAt: [sx * -8.0, 3.8, -1.4],
      noclip: false
    })
  },

  // =========================================================================
  // CHAPTER 4: THE MEDIAL (LABYRINTHINE) WALL
  // =========================================================================
  {
    id: 'step_4_1',
    chapterId: 'ch4',
    type: 'teach',
    title: 'Medial Wall Part 1: Promontory & The Two Windows',
    body:
      'We’ve temporarily ghosted the ossicles and turned on X-Ray so you can see the secret of the rose Medial Wall: every feature on it is molded by the Inner Ear right behind it! The big central dome — the Promontory — is pushed outward by the wide first (basal) turn of the snail Cochlea. Posterosuperior to it sits the kidney-shaped Oval Window (leading to the vestibule); posteroinferior sits the Round Window tucked under a bony hood.',
    memoryHook:
      'Spatial triad around the Promontory dome: Promontory in the middle (basal turn of cochlea = high-frequency hearing!), OVAL Window UP-and-back (receives Stapes), ROUND Window DOWN-and-back (sealed by Secondary Tympanic Membrane)!',
    focusIds: ['promontory', 'oval_window', 'round_window', 'inner_ear_labyrinth'],
    sceneState: { xrayMode: 1, ossicleMode: 1, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 1.1, 0.7, 0.4],
      lookAt: [sx * -0.7, 0.3, -6.5],
      noclip: false
    })
  },

  {
    id: 'step_4_2',
    chapterId: 'ch4',
    type: 'teach',
    title: 'Medial Wall Part 2: Stacked Ridges & The Spoon Pulley',
    body:
      'Look just ABOVE the Oval Window: a cylindrical bony tube arches backward across the medial wall and bends down behind the posterior wall — that’s the Prominence of the Facial Nerve Canal (CN VII)! Immediately ABOVE the facial canal bulges a second ridge: the Prominence of the Lateral Semicircular Canal. Finally, anterosuperior to the oval window curves a spoon-shaped bony hook: the Processus Cochleariformis.',
    memoryHook:
      'Memorize the 3-story vertical stack on the posterosuperior Medial Wall from bottom to top: (1) Oval Window → (2) Facial Nerve Canal (CN VII) → (3) Lateral Semicircular Canal! And right in front of CN VII sits the spoon pulley (Processus Cochleariformis).',
    focusIds: ['facial_canal_prominence', 'lateral_scc_prominence', 'processus_cochleariformis'],
    sceneState: { xrayMode: 0, ossicleMode: 1, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 1.4, 2.6, 0.2],
      lookAt: [sx * -2.2, 3.6, -6.4],
      noclip: false
    })
  },

  {
    id: 'step_4_cp',
    chapterId: 'ch4',
    type: 'checkpoint',
    title: 'Checkpoint 3 of 6 — Medial Wall Mastery',
    prompt:
      'In ~10–15% of people its thin bony covering is naturally dehiscent, putting a major cranial nerve at risk during middle-ear inflammation. Aim and Left-Click the bony ridge immediately ABOVE the oval window and BELOW the lateral semicircular canal!',
    targetId: 'facial_canal_prominence',
    hint: 'Find the Oval Window first, then look at the horizontal/oblique tubular ridge directly above it on the Medial Wall.',
    successNote:
      'Exactly right! The Prominence of the Facial Nerve Canal (Fallopian canal housing CN VII) runs right between the oval window below and the lateral semicircular canal prominence above.',
    sceneState: { xrayMode: 0, ossicleMode: 1, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 1.2, 1.8, 0.6],
      lookAt: [sx * -1.8, 2.2, -6.4],
      noclip: false
    })
  },

  // =========================================================================
  // CHAPTER 5: AUDITORY OSSICLES & SOUND MECHANICS
  // =========================================================================
  {
    id: 'step_5_1',
    chapterId: 'ch5',
    type: 'teach',
    title: 'Specimen Tour of the 3 Smallest Bones: Malleus → Incus → Stapes',
    body:
      'Inspect the sculpted ossicles up close! (1) Malleus (1st arch): spatulate handle embedded at the umbo, lateral process jutting into the eardrum, club head up in the attic. (2) Incus (1st arch, premolar-tooth shape): saddle joint with malleus head, short limb anchored in fossa incudis, tenuous long limb hooking medially as the lenticular process. (3) Stapes (2nd arch): straighter anterior crus, more curved posterior crus, and kidney-shaped footplate in the oval window!',
    memoryHook:
      'Specimen & Exam Pearls: Malleus + Incus = 1st Pharyngeal Arch; Stapes = 2nd Arch! The long limb of the Incus has the weakest blood supply (most common ossicular necrosis). On a real isolated Stapes, the MORE CURVED leg is always POSTERIOR!',
    focusIds: ['malleus', 'incus', 'stapes'],
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 5.0, -0.8, -1.2],
      lookAt: [sx * -1.1, 2.5, -0.5],
      noclip: false
    })
  },

  {
    id: 'step_5_2',
    chapterId: 'ch5',
    type: 'teach',
    title: 'Live Biomechanics: 22× Impedance Gain & Opposite-Phase Round Window',
    body:
      'Watch the live sound wave animation! How does the middle ear overcome that 99.9% fluid reflection? Two multipliers: (1) Hydraulic Area Ratio (~17×): the large vibrating eardrum (~55 mm²) focuses force onto the tiny stapes footplate (~3.2 mm²); (2) Lever Action (~1.3×): the longer malleus handle rocks the shorter incus limb (~22× total pressure gain!). Now watch the Round Window below as the Stapes pistons INWARD!',
    memoryHook:
      'Look closely at the teal Round Window right now: because inner-ear perilymph fluid is INCOMPRESSIBLE, every time the Stapes pushes IN at the Oval Window, the Secondary Tympanic Membrane MUST bulge OUT in 180° OPPOSITE PHASE so fluid can move and stimulate hair cells!',
    focusIds: ['tympanic_membrane', 'stapes', 'oval_window', 'round_window'],
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'normal' },
    camera: (sx) => ({
      pos: [sx * 2.2, 0.9, 1.2],
      lookAt: [sx * -1.7, 0.2, -5.8],
      noclip: false
    })
  },

  {
    id: 'step_5_cp',
    chapterId: 'ch5',
    type: 'checkpoint',
    title: 'Checkpoint 4 of 6 — Sound Conduction & Windows',
    prompt:
      'If this opening were rigidified by scar or bone, incompressible cochlear perilymph could not move when the stapes pushes inward, abolishing basilar-membrane wave motion. Aim and Left-Click the structure vibrating in OPPOSITE PHASE to the oval window!',
    targetId: 'round_window',
    hint: 'Look posteroinferior to the Promontory on the Medial Wall — watch it bulge outward each time the stapes pushes inward!',
    successNote:
      'Brilliant! The Round Window (Fenestra Cochleae), sealed by the Secondary Tympanic Membrane, bulges in opposite phase to stapes motion at the oval window.',
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'normal' },
    camera: (sx) => ({
      pos: [sx * 1.8, 0.9, 1.4],
      lookAt: [sx * -1.4, 0.1, -6.0],
      noclip: false
    })
  },

  // =========================================================================
  // CHAPTER 6: PROTECTIVE MUSCLES & THE ACOUSTIC REFLEX
  // =========================================================================
  {
    id: 'step_6_1',
    chapterId: 'ch6',
    type: 'teach',
    title: 'Loud Sound! The Acoustic Reflex: Anterior Pulley vs. Posterior Pyramid',
    body:
      'We just cranked up a LOUD sound — notice both middle-ear muscles glowing active crimson while ossicle vibration dampens by ~70%! Compare their symmetry: (1) Tensor Tympani enters from the ANTERIOR wall, hooks 90° laterally around the Processus Cochleariformis spoon pulley, and pulls the Malleus neck medially. (2) Stapedius (smallest skeletal muscle in the body!) hides inside the Pyramidal Eminence on the POSTERIOR wall and pulls the Stapes neck backward.',
    memoryHook:
      'Embryology makes nerve supply effortless! Malleus = 1st Arch → Tensor Tympani is innervated by CN V3 (chewing nerve!). Stapes = 2nd Arch → Stapedius is innervated by CN VII (facial nerve — injury causes painful HYPERACUSIS!).',
    focusIds: [
      'tensor_tympani_muscle',
      'processus_cochleariformis',
      'stapedius_muscle',
      'pyramidal_eminence'
    ],
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'loud' },
    camera: (sx) => ({
      pos: [sx * -0.4, 2.2, 3.6],
      lookAt: [sx * -1.2, 2.4, -4.5],
      noclip: false
    })
  },

  {
    id: 'step_6_cp',
    chapterId: 'ch6',
    type: 'checkpoint',
    title: 'Checkpoint 5 of 6 — Clinical Muscle & Nerve Localization',
    prompt:
      'A patient presents with acute ipsilateral facial paralysis AND reports that ordinary clattering dishes sound painfully loud (hyperacusis) in that ear. Aim and Left-Click the paralyzed muscle/tendon responsible for the hyperacusis!',
    targetId: 'stapedius_muscle',
    hint: 'CN VII innervates the 2nd-arch muscle emerging from the tip of the Pyramidal Eminence on the Posterior Wall toward the neck of the stapes!',
    successNote:
      'Spot on! Paralysis of the Stapedius muscle (innervated by CN VII) removes acoustic-reflex damping on the stapes, producing hyperacusis.',
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'loud' },
    camera: (sx) => ({
      pos: [sx * -0.4, 2.2, 3.6],
      lookAt: [sx * -1.8, 2.2, -4.2],
      noclip: false
    })
  },

  // =========================================================================
  // CHAPTER 7: THE NERVE CROSSROADS
  // =========================================================================
  {
    id: 'step_7_1',
    chapterId: 'ch7',
    type: 'teach',
    title: 'Chorda Tympani: Threading the Needle Between Malleus & Incus',
    body:
      'Look behind the walls in X-Ray: golden CN VII bends at the Geniculate Ganglion (giving off the Greater Petrosal Nerve), runs horizontally above the oval window, and descends vertically behind the posterior wall. Just before exiting the skull, it sends the bare Chorda Tympani nerve arching right across the air-filled room — look directly in front of you at how it threads BETWEEN the two upper ossicles!',
    memoryHook:
      'High-Yield Spatial Rule — see it with your own eyes right here: Chorda Tympani passes MEDIAL to the neck of the Malleus and LATERAL to the long limb of the Incus! Carries anterior 2/3 tongue taste + submandibular/sublingual salivation.',
    focusIds: ['chorda_tympani', 'facial_nerve_cn7', 'malleus', 'incus'],
    sceneState: { xrayMode: 1, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 2.9, 4.1, 1.2],
      lookAt: [sx * -1.5, 3.8, 3.0],
      noclip: false
    })
  },

  {
    id: 'step_7_2',
    chapterId: 'ch7',
    type: 'teach',
    title: 'Tympanic Plexus (CN IX): Referred Earache & The Parotid Detour',
    body:
      'Finally, follow the golden nerve rising up through the Floor onto the dome of the Promontory! That is Jacobson’s Nerve (tympanic branch of Glossopharyngeal CN IX). On the promontory it forms the Tympanic Plexus (joined by sympathetic caroticotympanic fibers piercing the anterior carotid wall), supplies sensory fibers to the entire middle-ear mucosa, and exits upward through the Roof as the Lesser Petrosal Nerve!',
    memoryHook:
      'Two USMLE classics in one nerve web: (1) Why does tonsillitis or base-of-tongue cancer cause severe EARACHE? Shared CN IX sensory fibers! (2) Parotid gland secretomotor relay: CN IX → Jacobson’s nerve → Tympanic plexus → Lesser petrosal nerve (out the roof!) → Otic ganglion → Parotid!',
    focusIds: ['tympanic_plexus', 'promontory', 'jugular_wall', 'tegmen_tympani'],
    sceneState: { xrayMode: 0, ossicleMode: 1, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 2.2, -0.4, 0.2],
      lookAt: [sx * 0.6, -0.5, -5.2],
      noclip: false
    })
  },

  {
    id: 'step_7_cp',
    chapterId: 'ch7',
    type: 'checkpoint',
    title: 'Final Checkpoint (6 of 6) — The Classic Ossicular Nerve Thread',
    prompt:
      'During middle-ear surgery for chronic otitis media, an exposed nerve traversing bare across the upper tympanic cavity is accidentally stretched, causing ipsilateral metallic/lost taste on the anterior 2/3 of the tongue WITHOUT facial weakness. Fly/aim and Left-Click that nerve!',
    targetId: 'chorda_tympani',
    hint: 'Look high up between the Malleus handle/neck (laterally) and the Incus long limb (medially) for the golden nerve wire arching from posterior to anterior!',
    successNote:
      'Masterclass complete!! You’ve walked every boundary, opening, ossicle, muscle, neighbor, and cranial nerve of the Middle Ear in 3D — switch to Fly & Pick Quiz anytime to test all 32 structures blind!',
    sceneState: { xrayMode: 0, ossicleMode: 0, doorOpen: false, soundMode: 'off' },
    camera: (sx) => ({
      pos: [sx * 2.8, 3.8, 0.9],
      lookAt: [sx * -1.2, 3.8, 3.1],
      noclip: false
    })
  }
];
