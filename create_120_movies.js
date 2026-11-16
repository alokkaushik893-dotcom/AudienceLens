import fs from 'fs';
import path from 'path';

const rawList = [
  {
    title: "The Godfather",
    year: 1972,
    genres: ["Crime", "Drama"],
    rating: 9.2,
    votes: 2045000,
    runtime: 175,
    director: "Francis Ford Coppola",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant, calculating youngest son."
  },
  {
    title: "The Godfather Part II",
    year: 1974,
    genres: ["Crime", "Drama"],
    rating: 9.0,
    votes: 1380000,
    runtime: 202,
    director: "Francis Ford Coppola",
    overview: "Coppola parallels young Vito Corleone's immigrant rise in Hell's Kitchen with Michael Corleone's tragic spiritual desolation expanding into Nevada and pre-revolutionary Cuba."
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    genres: ["Crime", "Drama"],
    rating: 8.9,
    votes: 2210000,
    runtime: 154,
    director: "Quentin Tarantino",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
  },
  {
    title: "Oppenheimer",
    year: 2023,
    genres: ["Biography", "Drama", "History"],
    rating: 8.9,
    votes: 825000,
    runtime: 180,
    director: "Christopher Nolan",
    overview: "Theoretical physicist J. Robert Oppenheimer directs the Manhattan Project at Los Alamos and subsequently endures the weaponization of bureaucratic loyalty proceedings."
  },
  {
    title: "Seven Samurai",
    year: 1954,
    genres: ["Action", "Drama"],
    rating: 8.6,
    votes: 362400,
    runtime: 207,
    director: "Akira Kurosawa",
    overview: "A desperate farming village hires seven masterless samurai to coordinate defensive fortifications and counter-attacks against marauding bandits."
  },
  {
    title: "Spirited Away",
    year: 2001,
    genres: ["Animation", "Adventure", "Family"],
    rating: 8.6,
    votes: 852000,
    runtime: 125,
    director: "Hayao Miyazaki",
    overview: "A sullen ten-year-old girl wanders into an abandoned spirit-bathhouse and must work under a sorceress to liberate her transformed parents."
  },
  {
    title: "City of God",
    year: 2002,
    genres: ["Crime", "Drama"],
    rating: 8.6,
    votes: 820000,
    runtime: 130,
    director: "Fernando Meirelles, Kátia Lund",
    overview: "In the violent favelas of Rio de Janeiro, two young men follow divergent paths as one pursues photojournalism while the other builds a ruthless drug empire."
  },
  {
    title: "Parasite",
    year: 2019,
    genres: ["Drama", "Thriller"],
    rating: 8.5,
    votes: 940000,
    runtime: 132,
    director: "Bong Joon-ho",
    overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
  },
  {
    title: "Psycho",
    year: 1960,
    genres: ["Horror", "Mystery", "Thriller"],
    rating: 8.5,
    votes: 724000,
    runtime: 109,
    director: "Alfred Hitchcock",
    overview: "A Phoenix secretary on the run with stolen funds checks into a secluded motel run by an uneasy young taxidermist under his mother's domination."
  },
  {
    title: "Rear Window",
    year: 1954,
    genres: ["Mystery", "Thriller"],
    rating: 8.5,
    votes: 521000,
    runtime: 112,
    director: "Alfred Hitchcock",
    overview: "A wheelchair-bound recuperating photographer spies on his courtyard neighbors from his Greenwich Village apartment window and suspects a murder."
  },
  {
    title: "Casablanca",
    year: 1942,
    genres: ["Drama", "Romance", "War"],
    rating: 8.5,
    votes: 595000,
    runtime: 102,
    director: "Michael Curtiz",
    overview: "A cynical American expatriate nightclub owner in wartime Morocco is challenged when his former lover and her fugitive resistance husband enter his gin joint."
  },
  {
    title: "Modern Times",
    year: 1936,
    genres: ["Comedy", "Drama", "Romance"],
    rating: 8.5,
    votes: 254000,
    runtime: 87,
    director: "Charlie Chaplin",
    overview: "The Tramp battles mechanical assembly lines, factory automation, and unemployment during the Great Depression with the aid of a young gamine."
  },
  {
    title: "Alien",
    year: 1979,
    genres: ["Horror", "Sci-Fi"],
    rating: 8.5,
    votes: 955000,
    runtime: 117,
    director: "Ridley Scott",
    overview: "The crew of a commercial space tug investigates a derelict alien craft, unwittingly taking aboard a lethal parasitic organism."
  },
  {
    title: "Cinema Paradiso",
    year: 1988,
    genres: ["Drama", "Romance"],
    rating: 8.5,
    votes: 295000,
    runtime: 155,
    director: "Giuseppe Tornatore",
    overview: "A filmmaker recalls his childhood in a war-torn Sicilian village where the local projectionist ignited his lifelong enchantment with celluloid."
  },
  {
    title: "Once Upon a Time in the West",
    year: 1968,
    genres: ["Western"],
    rating: 8.5,
    votes: 368000,
    runtime: 165,
    director: "Sergio Leone",
    overview: "A mysterious harmonica-playing stranger joins forces with a notorious desperado to protect a beautiful widow from a ruthless railroad assassin."
  },
  {
    title: "Sunset Boulevard",
    year: 1950,
    genres: ["Drama", "Film-Noir"],
    rating: 8.4,
    votes: 231000,
    runtime: 110,
    director: "Billy Wilder",
    overview: "A struggling Hollywood screenwriter develops a toxic relationship with a faded silent movie star who dreams of a triumphant cinematic return."
  },
  {
    title: "Apocalypse Now",
    year: 1979,
    genres: ["Drama", "War"],
    rating: 8.4,
    votes: 708000,
    runtime: 147,
    director: "Francis Ford Coppola",
    overview: "During the Vietnam War, a weary army captain takes a patrol boat upriver into Cambodia to assassinate a renegade Special Forces colonel."
  },
  {
    title: "Dr. Strangelove",
    year: 1964,
    genres: ["Comedy", "War"],
    rating: 8.4,
    votes: 512000,
    runtime: 95,
    director: "Stanley Kubrick",
    overview: "An insane American general orders a preemptive nuclear strike on the Soviet Union, triggering chaotic bureaucratic panic inside the Pentagon's War Room."
  },
  {
    title: "Princess Mononoke",
    year: 1997,
    genres: ["Animation", "Action", "Adventure"],
    rating: 8.4,
    votes: 436000,
    runtime: 134,
    director: "Hayao Miyazaki",
    overview: "On a journey to cure an iron-curse, an Emishi warrior finds himself caught between an industrialized iron mining settlement and the gods of the sacred forest."
  },
  {
    title: "High and Low",
    year: 1963,
    genres: ["Crime", "Drama", "Mystery"],
    rating: 8.4,
    votes: 58900,
    runtime: 143,
    director: "Akira Kurosawa",
    overview: "An executive of a Yokohama shoe company faces ruin when extortionists kidnap his chauffeur's young son by mistake and demand his entire fortune."
  },
  {
    title: "Come and See",
    year: 1985,
    genres: ["Drama", "War"],
    rating: 8.4,
    votes: 112000,
    runtime: 142,
    director: "Elem Klimov",
    overview: "A young Byelorussian boy joins partisan fighters in 1943, descending into the sensory nightmare of Nazi extermination tactics across the countryside."
  },
  {
    title: "Citizen Kane",
    year: 1941,
    genres: ["Drama", "Mystery"],
    rating: 8.3,
    votes: 452000,
    runtime: 119,
    director: "Orson Welles",
    overview: "Following the death of publishing tycoon Charles Foster Kane, reporters scramble to decipher the meaning of his enigmatic final utterance."
  },
  {
    title: "Metropolis",
    year: 1927,
    genres: ["Drama", "Sci-Fi"],
    rating: 8.3,
    votes: 184500,
    runtime: 153,
    director: "Fritz Lang",
    overview: "In a futuristic city sharply divided between the working class and the wealthy industrialists, the city mastermind's son falls in love with a prophetic worker."
  },
  {
    title: "M",
    year: 1931,
    genres: ["Crime", "Mystery", "Thriller"],
    rating: 8.3,
    votes: 165000,
    runtime: 117,
    director: "Fritz Lang",
    overview: "When the police are unable to catch a child killer terrorizing Berlin, the criminal underworld joins the manhunt to halt the disruptive police raids."
  },
  {
    title: "Bicycle Thieves",
    year: 1948,
    genres: ["Drama"],
    rating: 8.3,
    votes: 174000,
    runtime: 89,
    director: "Vittorio De Sica",
    overview: "In post-war Rome, an impoverished father and his young son search for the stolen bicycle essential to keeping his job posting cinema handbills."
  },
  {
    title: "Vertigo",
    year: 1958,
    genres: ["Mystery", "Romance", "Thriller"],
    rating: 8.3,
    votes: 432000,
    runtime: 128,
    director: "Alfred Hitchcock",
    overview: "A former San Francisco police detective suffering from acrophobia investigates the strange activities of an acquaintance's wife, becoming dangerously obsessed."
  },
  {
    title: "North by Northwest",
    year: 1959,
    genres: ["Action", "Adventure", "Mystery"],
    rating: 8.3,
    votes: 356000,
    runtime: 136,
    director: "Alfred Hitchcock",
    overview: "A Manhattan advertising executive is pursued across the country by foreign spies after being mistaken for a nonexistent government agent."
  },
  {
    title: "Lawrence of Arabia",
    year: 1962,
    genres: ["Adventure", "Biography", "Drama"],
    rating: 8.3,
    votes: 312000,
    runtime: 228,
    director: "David Lean",
    overview: "During World War I, British officer T.E. Lawrence unites rival Bedouin tribes to fight against the Ottoman Empire across the desert expanses."
  },
  {
    title: "2001: A Space Odyssey",
    year: 1968,
    genres: ["Sci-Fi", "Mystery"],
    rating: 8.3,
    votes: 721000,
    runtime: 149,
    director: "Stanley Kubrick",
    overview: "After uncovering a mysterious artifact buried beneath the lunar surface, a spacecraft crew accompanied by sentient computer HAL 9000 sets off for Jupiter."
  },
  {
    title: "A Clockwork Orange",
    year: 1971,
    genres: ["Crime", "Sci-Fi"],
    rating: 8.3,
    votes: 852000,
    runtime: 136,
    director: "Stanley Kubrick",
    overview: "In a dystopian future, a sadistic gang leader is imprisoned and volunteers for a controversial aversion-therapy experiment conducted by the state."
  },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    year: 2004,
    genres: ["Drama", "Romance", "Sci-Fi"],
    rating: 8.3,
    votes: 1080000,
    runtime: 108,
    director: "Michel Gondry",
    overview: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories."
  },
  {
    title: "A Separation",
    year: 2011,
    genres: ["Drama"],
    rating: 8.3,
    votes: 260000,
    runtime: 123,
    director: "Asghar Farhadi",
    overview: "A married Iranian couple faces a difficult decision to improve the life of their child by moving abroad or to stay in Iran to look after a parent with Alzheimer's."
  },
  {
    title: "Heat",
    year: 1995,
    genres: ["Action", "Crime", "Drama"],
    rating: 8.3,
    votes: 720000,
    runtime: 170,
    director: "Michael Mann",
    overview: "A master thief and an obsessive LAPD homicide lieutenant track each other across the illuminated asphalt grid of Los Angeles."
  },
  {
    title: "A Brighter Summer Day",
    year: 1991,
    genres: ["Crime", "Drama", "Romance"],
    rating: 8.3,
    votes: 21500,
    runtime: 237,
    director: "Edward Yang",
    overview: "Yang examines the tensions of adolescent street gangs, exile, and familial disillusionment in 1960s Taipei culminating in a sensational juvenile murder."
  },
  {
    title: "Pather Panchali",
    year: 1955,
    genres: ["Drama"],
    rating: 8.3,
    votes: 41200,
    runtime: 125,
    director: "Satyajit Ray",
    overview: "Impoverished priest Harihar Ray dreams of a better life for his family in rural Bengal as his young son Apu encounters the wonder and hardship of the world."
  },
  {
    title: "Sansho the Bailiff",
    year: 1954,
    genres: ["Drama"],
    rating: 8.3,
    votes: 21000,
    runtime: 124,
    director: "Kenji Mizoguchi",
    overview: "In feudal Japan, the children and wife of a principled exiled governor are sold into cruel enslavement, sparking an enduring quest for familial reclamation."
  },
  {
    title: "Late Spring",
    year: 1949,
    genres: ["Drama"],
    rating: 8.2,
    votes: 42100,
    runtime: 108,
    director: "Yasujirō Ozu",
    overview: "A devoted twenty-seven-year-old daughter resists pressure to marry so she can continue taking care of her widowed professor father."
  },
  {
    title: "Rashomon",
    year: 1950,
    genres: ["Crime", "Drama", "Mystery"],
    rating: 8.2,
    votes: 176500,
    runtime: 88,
    director: "Akira Kurosawa",
    overview: "A heinous crime and its aftermath are recalled from differing points of view by a bandit, a samurai's wife, a woodcutter, and the slain samurai's ghost."
  },
  {
    title: "Yojimbo",
    year: 1961,
    genres: ["Action", "Drama", "Thriller"],
    rating: 8.2,
    votes: 134000,
    runtime: 110,
    director: "Akira Kurosawa",
    overview: "A crafty masterless samurai arrives in a small town divided between two warring crime bosses, cunningly playing both sides against one another."
  },
  {
    title: "Ran",
    year: 1985,
    genres: ["Action", "Drama", "War"],
    rating: 8.2,
    votes: 138000,
    runtime: 162,
    director: "Akira Kurosawa",
    overview: "In Medieval Japan, an elderly warlord retires and hands over his empire to his three sons, who promptly turn on each other in an apocalyptic civil war."
  },
  {
    title: "Chinatown",
    year: 1974,
    genres: ["Drama", "Mystery", "Thriller"],
    rating: 8.2,
    votes: 350000,
    runtime: 130,
    director: "Roman Polanski",
    overview: "A private eye hired to expose an adulterer in 1930s Los Angeles is drawn into a web of deceit, corruption, and murder linked to the city's water supply."
  },
  {
    title: "Taxi Driver",
    year: 1976,
    genres: ["Crime", "Drama"],
    rating: 8.2,
    votes: 915000,
    runtime: 114,
    director: "Martin Scorsese",
    overview: "A mentally unstable veteran works as a nighttime taxi driver in New York City, where the perceived decay fuels his urge for violent action."
  },
  {
    title: "There Will Be Blood",
    year: 2007,
    genres: ["Drama"],
    rating: 8.2,
    votes: 642000,
    runtime: 158,
    director: "Paul Thomas Anderson",
    overview: "A ruthlessly misanthropic turn-of-the-century oil prospector pursues power and wealth, clashing with a charismatic local evangelist."
  },
  {
    title: "No Country for Old Men",
    year: 2007,
    genres: ["Crime", "Drama", "Thriller"],
    rating: 8.2,
    votes: 1060000,
    runtime: 122,
    director: "Joel Coen, Ethan Coen",
    overview: "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande."
  },
  {
    title: "Pan's Labyrinth",
    year: 2006,
    genres: ["Drama", "Fantasy", "War"],
    rating: 8.2,
    votes: 708000,
    runtime: 118,
    director: "Guillermo del Toro",
    overview: "In the falangist aftermath of the Spanish Civil War, an imaginative young girl retreats into an alluring and terrifying mythical labyrinth."
  },
  {
    title: "Yi Yi",
    year: 2000,
    genres: ["Drama", "Romance"],
    rating: 8.2,
    votes: 31000,
    runtime: 173,
    director: "Edward Yang",
    overview: "Each member of a middle-class Taipei family seeks reconciliation with life's complications during the course of a single year framed by a wedding and a funeral."
  },
  {
    title: "Close-Up",
    year: 1990,
    genres: ["Biography", "Drama"],
    rating: 8.2,
    votes: 24800,
    runtime: 77,
    director: "Abbas Kiarostami",
    overview: "Kiarostami dramatizes the real-life trial of an impoverished cinephile who conned a wealthy Tehran family by impersonating director Mohsen Makhmalbaf."
  },
  {
    title: "La Jetée",
    year: 1962,
    genres: ["Sci-Fi", "Romance"],
    rating: 8.2,
    votes: 48000,
    runtime: 28,
    director: "Chris Marker",
    overview: "In post-nuclear subterranean Paris, scientists send a prisoner back through time using his persistent childhood memory of an airport pier."
  },
  {
    title: "Ordet",
    year: 1955,
    genres: ["Drama"],
    rating: 8.2,
    votes: 19500,
    runtime: 126,
    director: "Carl Theodor Dreyer",
    overview: "The members of a Danish farming family navigate religious discord until a brother who believes he is Jesus Christ commands an astonishing miracle."
  },
  {
    title: "Tokyo Story",
    year: 1953,
    genres: ["Drama"],
    rating: 8.1,
    votes: 68400,
    runtime: 136,
    director: "Yasujirō Ozu",
    overview: "An elderly provincial couple travels to postwar Tokyo to visit their adult children, only to be met with quiet indifference and bustling neglect."
  },
  {
    title: "Persona",
    year: 1966,
    genres: ["Drama", "Mystery"],
    rating: 8.1,
    votes: 124800,
    runtime: 84,
    director: "Ingmar Bergman",
    overview: "A stage actress who suddenly falls mute during an Electra performance retreats to a coastal cottage with a talkative young nurse who confides in her."
  },
  {
    title: "Stalker",
    year: 1979,
    genres: ["Sci-Fi", "Drama"],
    rating: 8.1,
    votes: 142000,
    runtime: 162,
    director: "Andrei Tarkovsky",
    overview: "A hired guide leads a cynical writer and an anxious scientist through an overgrown, guarded anomalous zone toward a room that grants innermost desires."
  },
  {
    title: "The Passion of Joan of Arc",
    year: 1928,
    genres: ["Drama", "Biography"],
    rating: 8.1,
    votes: 61200,
    runtime: 110,
    director: "Carl Theodor Dreyer",
    overview: "In 1431, Jeanne d'Arc is placed on trial on charges of heresy, documented in suffocating cinematic close-ups of ecclesiastical interrogation."
  },
  {
    title: "The Third Man",
    year: 1949,
    genres: ["Film-Noir", "Mystery", "Thriller"],
    rating: 8.1,
    votes: 182000,
    runtime: 104,
    director: "Carol Reed",
    overview: "A naive American pulp writer arrives in partition-era Vienna to meet his childhood friend Harry Lime, only to discover Lime died in a suspicious accident."
  },
  {
    title: "The Seventh Seal",
    year: 1957,
    genres: ["Drama", "Fantasy"],
    rating: 8.1,
    votes: 198000,
    runtime: 96,
    director: "Ingmar Bergman",
    overview: "A medieval knight returning from the Crusades challenges the Grim Reaper to a game of chess while plague ravages the Swedish countryside."
  },
  {
    title: "The 400 Blows",
    year: 1959,
    genres: ["Drama", "Crime"],
    rating: 8.1,
    votes: 124000,
    runtime: 99,
    director: "François Truffaut",
    overview: "A young Parisian boy neglected by his parents and strict schoolteachers descends into petty crime and is sent to a seaside observation center."
  },
  {
    title: "Andrei Rublev",
    year: 1966,
    genres: ["Biography", "Drama", "History"],
    rating: 8.1,
    votes: 58000,
    runtime: 205,
    director: "Andrei Tarkovsky",
    overview: "The life, times, and spiritual crisis of fifteenth-century Russian icon painter Andrei Rublev unfold across eight sprawling historical episodes."
  },
  {
    title: "Raging Bull",
    year: 1980,
    genres: ["Biography", "Drama", "Sport"],
    rating: 8.1,
    votes: 382000,
    runtime: 129,
    director: "Martin Scorsese",
    overview: "The self-destructive violent fury that propels middleweight boxer Jake LaMotta to the championship destroys his domestic life outside the ring."
  },
  {
    title: "Blade Runner",
    year: 1982,
    genres: ["Sci-Fi", "Thriller"],
    rating: 8.1,
    votes: 825000,
    runtime: 117,
    director: "Ridley Scott",
    overview: "A burnt-out blade runner is assigned to terminate four rogue humanoid replicants who have stolen a ship in space and returned to dystopian Los Angeles."
  },
  {
    title: "Fanny and Alexander",
    year: 1982,
    genres: ["Drama"],
    rating: 8.1,
    votes: 68000,
    runtime: 188,
    director: "Ingmar Bergman",
    overview: "Two young siblings in early twentieth-century Sweden experience the joyful theatrical warmth of their extended family before entering the cold home of a puritanical stepfather."
  },
  {
    title: "Paris, Texas",
    year: 1984,
    genres: ["Drama"],
    rating: 8.1,
    votes: 128000,
    runtime: 147,
    director: "Wim Wenders",
    overview: "An amnesiac drifter wanders out of the desert to reconnect with his young son and brother before setting off across Texas to find his missing wife."
  },
  {
    title: "La Haine",
    year: 1995,
    genres: ["Crime", "Drama"],
    rating: 8.1,
    votes: 215000,
    runtime: 98,
    director: "Mathieu Kassovitz",
    overview: "Three young men from diverse immigrant backgrounds spend twenty-four hours in the Paris suburbs following violent riots, carrying a lost police revolver."
  },
  {
    title: "Fargo",
    year: 1996,
    genres: ["Crime", "Thriller"],
    rating: 8.1,
    votes: 730000,
    runtime: 98,
    director: "Joel Coen, Ethan Coen",
    overview: "A Minnesota car salesman's inept plot to hire two bumbling criminals to kidnap his wife for ransom unravels due to relentless police chief Marge Gunderson."
  },
  {
    title: "In the Mood for Love",
    year: 2000,
    genres: ["Drama", "Romance"],
    rating: 8.1,
    votes: 174000,
    runtime: 98,
    director: "Wong Kar-wai",
    overview: "Two neighbors in 1962 Hong Kong form a delicate, chaste bond after discovering that their respective spouses are carrying on an affair."
  },
  {
    title: "Memories of Murder",
    year: 2003,
    genres: ["Crime", "Drama", "Mystery"],
    rating: 8.1,
    votes: 230000,
    runtime: 132,
    director: "Bong Joon-ho",
    overview: "In 1986 provincial South Korea, two ill-equipped local detectives and a Seoul specialist struggle through the investigation of a gruesome series of murders."
  },
  {
    title: "The Grand Budapest Hotel",
    year: 2014,
    genres: ["Adventure", "Comedy", "Crime"],
    rating: 8.1,
    votes: 890000,
    runtime: 99,
    director: "Wes Anderson",
    overview: "A legendary concierge at a famed European ski resort and his trusted lobby boy become entangled in the theft of a priceless Renaissance painting."
  },
  {
    title: "Mad Max: Fury Road",
    year: 2015,
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.1,
    votes: 1090000,
    runtime: 120,
    director: "George Miller",
    overview: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners and a drifting loner."
  },
  {
    title: "Portrait of a Lady on Fire",
    year: 2019,
    genres: ["Drama", "Romance"],
    rating: 8.1,
    votes: 118000,
    runtime: 122,
    director: "Céline Sciamma",
    overview: "On an isolated island in Brittany at the end of the eighteenth century, a female painter is commissioned to paint a wedding portrait of a reluctant young woman."
  },
  {
    title: "The Battle of Algiers",
    year: 1966,
    genres: ["Drama", "War"],
    rating: 8.1,
    votes: 68500,
    runtime: 121,
    director: "Gillo Pontecorvo",
    overview: "A newsreel-style recreation of the Algerian struggle for independence from French colonial rule in the dense alleys of the Algiers Casbah."
  },
  {
    title: "8½",
    year: 1963,
    genres: ["Drama"],
    rating: 8.0,
    votes: 134200,
    runtime: 138,
    director: "Federico Fellini",
    overview: "A harried movie director retreats into his memories and fantasies at a health spa while stalling production on his science fiction film."
  },
  {
    title: "The Night of the Hunter",
    year: 1955,
    genres: ["Crime", "Drama", "Film-Noir"],
    rating: 8.0,
    votes: 98000,
    runtime: 92,
    director: "Charles Laughton",
    overview: "A sinister itinerant preacher posing as a man of faith marries a gullible widow to steal ten thousand dollars hidden by her executed husband."
  },
  {
    title: "La Dolce Vita",
    year: 1960,
    genres: ["Comedy", "Drama"],
    rating: 8.0,
    votes: 82000,
    runtime: 174,
    director: "Federico Fellini",
    overview: "A restless society journalist wanders through the hedonistic, glamorous nights and empty dawns of Rome's high society seeking lasting purpose."
  },
  {
    title: "The Conformist",
    year: 1970,
    genres: ["Drama"],
    rating: 8.0,
    votes: 35000,
    runtime: 111,
    director: "Bernardo Bertolucci",
    overview: "A repressed Italian civil servant agrees to assassinate his former anti-fascist college professor in Paris to prove his loyalty to the regime."
  },
  {
    title: "Solaris",
    year: 1972,
    genres: ["Drama", "Sci-Fi"],
    rating: 8.0,
    votes: 104000,
    runtime: 167,
    director: "Andrei Tarkovsky",
    overview: "A psychologist sent to investigate strange occurrences aboard a research station orbiting a sentient oceanic planet is confronted by his deceased wife."
  },
  {
    title: "Mirror",
    year: 1975,
    genres: ["Biography", "Drama"],
    rating: 8.0,
    votes: 52000,
    runtime: 107,
    director: "Andrei Tarkovsky",
    overview: "A dying poet recalls his childhood, his mother's wartime devotion, and postwar historical upheavals through a non-linear mosaic of dreams and memories."
  },
  {
    title: "Wings of Desire",
    year: 1987,
    genres: ["Drama", "Fantasy", "Romance"],
    rating: 8.0,
    votes: 79000,
    runtime: 128,
    director: "Wim Wenders",
    overview: "An immortal angel eavesdrops on the quiet inner yearnings of divided Berliners until falling in love with a lonely circus trapeze artist."
  },
  {
    title: "Do the Right Thing",
    year: 1989,
    genres: ["Comedy", "Drama"],
    rating: 8.0,
    votes: 122000,
    runtime: 120,
    director: "Spike Lee",
    overview: "On the hottest summer day in a Brooklyn neighborhood, racial tensions between Black residents and local Italian pizzeria owners boil into tragedy."
  },
  {
    title: "Chungking Express",
    year: 1994,
    genres: ["Comedy", "Drama", "Romance"],
    rating: 8.0,
    votes: 104000,
    runtime: 102,
    director: "Wong Kar-wai",
    overview: "Two lovesick Hong Kong police officers cross paths with mysterious women around a late-night street food counter."
  },
  {
    title: "Magnolia",
    year: 1999,
    genres: ["Drama"],
    rating: 8.0,
    votes: 326000,
    runtime: 188,
    director: "Paul Thomas Anderson",
    overview: "A sprawling mosaic of interrelated Los Angeles characters navigate guilt, forgiveness, estrangement, and unexpected miracles over one rainy day."
  },
  {
    title: "Her",
    year: 2013,
    genres: ["Drama", "Romance", "Sci-Fi"],
    rating: 8.0,
    votes: 680000,
    runtime: 126,
    director: "Spike Jonze",
    overview: "In a near future, a lonely professional letter writer recovering from divorce develops an unexpected romantic relationship with an operating system."
  },
  {
    title: "Cries and Whispers",
    year: 1972,
    genres: ["Drama"],
    rating: 8.0,
    votes: 42000,
    runtime: 91,
    director: "Ingmar Bergman",
    overview: "In a crimson-draped manor, two estranged sisters and a devout housemaid attend to a woman dying of uterine cancer, exposing repressed family cruelties."
  },
  {
    title: "Mulholland Drive",
    year: 2001,
    genres: ["Drama", "Mystery", "Thriller"],
    rating: 7.9,
    votes: 374000,
    runtime: 147,
    director: "David Lynch",
    overview: "An optimistic young aspiring actress arrives in Hollywood and befriends an amnesiac woman recovering from a car accident in an enigmatic dreamscape."
  },
  {
    title: "The Rules of the Game",
    year: 1939,
    genres: ["Comedy", "Drama"],
    rating: 7.9,
    votes: 34000,
    runtime: 106,
    director: "Jean Renoir",
    overview: "A weekend hunting party at a French country estate brings the intricate, deceitful romantic codes of aristocrats and servants into sharp relief."
  },
  {
    title: "Cleo from 5 to 7",
    year: 1962,
    genres: ["Drama"],
    rating: 7.9,
    votes: 46000,
    runtime: 90,
    director: "Agnès Varda",
    overview: "A pop singer drifts through Paris in real-time as she waits for the results of a biopsy test, transforming from watched object to observant witness."
  },
  {
    title: "L'Avventura",
    year: 1960,
    genres: ["Drama", "Mystery"],
    rating: 7.8,
    votes: 35200,
    runtime: 144,
    director: "Michelangelo Antonioni",
    overview: "During a Mediterranean yachting cruise, a woman disappears on a desolate volcanic island, prompting her lover and best friend to embark on an aimless search."
  },
  {
    title: "Playtime",
    year: 1967,
    genres: ["Comedy"],
    rating: 7.8,
    votes: 36000,
    runtime: 124,
    director: "Jacques Tati",
    overview: "Monsieur Hulot navigates a futuristic, glass-and-steel Paris populated by bewildered American tourists and mechanized corporate exhibitions."
  },
  {
    title: "Past Lives",
    year: 2023,
    genres: ["Drama", "Romance"],
    rating: 7.8,
    votes: 168000,
    runtime: 105,
    director: "Celine Song",
    overview: "Two deeply connected childhood sweethearts are wrested apart when one emigrates from South Korea, reuniting two decades later in New York."
  },
  {
    title: "Au Hasard Balthazar",
    year: 1966,
    genres: ["Drama"],
    rating: 7.8,
    votes: 27500,
    runtime: 95,
    director: "Robert Bresson",
    overview: "The life story of a farm donkey passed through various human hands serves as an ascetic spiritual mirror of human malice, suffering, and redemption."
  },
  {
    title: "Aguirre, the Wrath of God",
    year: 1972,
    genres: ["Adventure", "Biography", "Drama"],
    rating: 7.8,
    votes: 66000,
    runtime: 95,
    director: "Werner Herzog",
    overview: "A power-crazed Spanish conquistador leads a mutinous band of explorers down the treacherous Amazon River on a doomed search for the mythical city of gold."
  },
  {
    title: "Breathless",
    year: 1960,
    genres: ["Crime", "Drama"],
    rating: 7.7,
    votes: 89000,
    runtime: 90,
    director: "Jean-Luc Godard",
    overview: "A young, reckless car thief shoots a policeman in Marseille and flees to Paris, where he attempts to persuade an American student to escape to Italy with him."
  },
  {
    title: "Blue Velvet",
    year: 1986,
    genres: ["Crime", "Drama", "Mystery"],
    rating: 7.7,
    votes: 218000,
    runtime: 120,
    director: "David Lynch",
    overview: "The discovery of a severed human ear found in a meadow leads a curious college student into a criminal conspiracy in idyllic suburban North Carolina."
  },
  {
    title: "Jeanne Dielman, 23, quai du Commerce, 1080 Bruxelles",
    year: 1975,
    genres: ["Drama"],
    rating: 7.7,
    votes: 29000,
    runtime: 201,
    director: "Chantal Akerman",
    overview: "A lonely Brussels homemaker goes about her daily domestic chores and evening sex work over three days until small disruptions unravel her routine."
  },
  {
    title: "Anatomy of a Fall",
    year: 2023,
    genres: ["Crime", "Drama", "Mystery"],
    rating: 7.7,
    votes: 172000,
    runtime: 151,
    director: "Justine Triet",
    overview: "A German writer is accused of murdering her husband after his fatal fall from their remote French chalet, leaving their visually impaired son as key witness."
  },
  {
    title: "Fallen Angels",
    year: 1995,
    genres: ["Comedy", "Crime", "Drama"],
    rating: 7.7,
    votes: 52000,
    runtime: 99,
    director: "Wong Kar-wai",
    overview: "In nighttime Hong Kong, a disillusioned hitman tries to leave his trade while a mute eccentric burglar breaks into night markets to run unauthorized business."
  },
  {
    title: "Days of Heaven",
    year: 1978,
    genres: ["Drama", "Romance"],
    rating: 7.7,
    votes: 68000,
    runtime: 94,
    director: "Terrence Malick",
    overview: "In 1916, a Chicago laborer and his lover pose as brother and sister while harvesting wheat on a wealthy, ailing Texas farmer's sprawling estate."
  },
  {
    title: "Drive My Car",
    year: 2021,
    genres: ["Drama"],
    rating: 7.6,
    votes: 68000,
    runtime: 179,
    director: "Ryusuke Hamaguchi",
    overview: "An aging theater director directing Uncle Vanya in Hiroshima develops an unexpected bond with the reserved young woman assigned to drive his red car."
  },
  {
    title: "Killers of the Flower Moon",
    year: 2023,
    genres: ["Crime", "Drama", "History"],
    rating: 7.6,
    votes: 242000,
    runtime: 206,
    director: "Martin Scorsese",
    overview: "In 1920s Oklahoma, members of the oil-wealthy Osage Nation are systematically poisoned and murdered for their oil rights under an insidious local conspiracy."
  },
  {
    title: "Pickpocket",
    year: 1959,
    genres: ["Crime", "Drama"],
    rating: 7.6,
    votes: 31000,
    runtime: 75,
    director: "Robert Bresson",
    overview: "A young intellectual in Paris embraces pickpocketing as an existential calling and a test of moral superiority over social conventions."
  },
  {
    title: "Beau Travail",
    year: 1999,
    genres: ["Drama"],
    rating: 7.4,
    votes: 23000,
    runtime: 92,
    director: "Claire Denis",
    overview: "A French Foreign Legion officer in Djibouti becomes consumed by jealousy and suppressed homoerotic desire toward an exceptionally promising new recruit."
  },
  {
    title: "Tár",
    year: 2022,
    genres: ["Drama", "Music"],
    rating: 7.4,
    votes: 182000,
    runtime: 158,
    director: "Todd Field",
    overview: "The career, personal life, and psychological composure of a brilliant conductor at a prestigious German orchestra unravels amid misconduct allegations."
  },
  {
    title: "The Zone of Interest",
    year: 2023,
    genres: ["Drama", "History", "War"],
    rating: 7.4,
    votes: 165000,
    runtime: 105,
    director: "Jonathan Glazer",
    overview: "Auschwitz commandant Rudolf Höss and his wife strive to build a dream garden life for their family in a house directly adjacent to the extermination camp."
  },
  {
    title: "Moonlight",
    year: 2016,
    genres: ["Drama"],
    rating: 7.4,
    votes: 310000,
    runtime: 111,
    director: "Barry Jenkins",
    overview: "A chronicle of the childhood, adolescence, and burgeoning adulthood of a young Black man growing up in a rough neighborhood of Miami."
  },
  {
    title: "Caché",
    year: 2005,
    genres: ["Drama", "Mystery", "Thriller"],
    rating: 7.3,
    votes: 84000,
    runtime: 117,
    director: "Michael Haneke",
    overview: "A bourgeois French television host and his wife receive surveillance videotapes of their home accompanied by disturbing childlike drawings."
  },
  {
    title: "The Master",
    year: 2012,
    genres: ["Drama"],
    rating: 7.2,
    votes: 178000,
    runtime: 138,
    director: "Paul Thomas Anderson",
    overview: "A traumatized naval veteran arrives home from World War II and falls under the sway of a charismatic philosophical movement leader."
  },
  {
    title: "The Tree of Life",
    year: 2011,
    genres: ["Drama", "Fantasy"],
    rating: 6.8,
    votes: 184000,
    runtime: 139,
    director: "Terrence Malick",
    overview: "A 1950s Texas boy grows up torn between the stern disciplinarian ethos of his father and the unconditional grace of his mother."
  },
  // Additional canonical repertory additions to complete exactly 120 films
  {
    title: "Le Samouraï",
    year: 1967,
    genres: ["Crime", "Drama", "Mystery"],
    rating: 8.0,
    votes: 62000,
    runtime: 105,
    director: "Jean-Pierre Melville",
    overview: "A silent, methodical hitman in Paris lives by an ascetic bushido code until a double-cross forces him to track down his treacherous employers."
  },
  {
    title: "Army of Shadows",
    year: 1969,
    genres: ["Drama", "War"],
    rating: 8.1,
    votes: 42000,
    runtime: 145,
    director: "Jean-Pierre Melville",
    overview: "Melville captures the grim, treacherous reality of French Resistance fighters operating beneath the radar in Nazi-occupied France."
  },
  {
    title: "Ugetsu",
    year: 1953,
    genres: ["Drama", "Fantasy"],
    rating: 8.2,
    votes: 27500,
    runtime: 96,
    director: "Kenji Mizoguchi",
    overview: "During the Sengoku civil wars, two ambitious peasants leave their wives to pursue wealth and samurai glory, encountering phantom spirits."
  },
  {
    title: "Ikiru",
    year: 1952,
    genres: ["Drama"],
    rating: 8.3,
    votes: 94000,
    runtime: 143,
    director: "Akira Kurosawa",
    overview: "A terminally ill Tokyo bureaucrat searches for purpose after thirty years of stamping paperwork, dedicating his remaining days to building a playground."
  },
  {
    title: "Throne of Blood",
    year: 1957,
    genres: ["Drama", "History"],
    rating: 8.0,
    votes: 56000,
    runtime: 110,
    director: "Akira Kurosawa",
    overview: "Kurosawa transposes Shakespeare's Macbeth to feudal Japan as a decorated warrior is propelled by prophecy and his ruthless wife to seize power."
  },
  {
    title: "The Battle of San Pietro",
    year: 1945,
    genres: ["War", "Documentary"],
    rating: 7.2,
    votes: 4200,
    runtime: 32,
    director: "John Huston",
    overview: "Huston's visceral, unvarnished military documentary captures the infantry meat grinder of the Italian campaign in 1943."
  },
  {
    title: "Man with a Movie Camera",
    year: 1929,
    genres: ["Documentary"],
    rating: 8.3,
    votes: 38000,
    runtime: 68,
    director: "Dziga Vertov",
    overview: "Vertov's dynamic constructivist symphony celebrates Soviet urban life, machines, and the liberating possibilities of the cinematic apparatus."
  },
  {
    title: "The Cabinet of Dr. Caligari",
    year: 1920,
    genres: ["Horror", "Mystery", "Thriller"],
    rating: 8.0,
    votes: 68000,
    runtime: 67,
    director: "Robert Wiene",
    overview: "A carnival hypnotist uses a sleepwalking medium to commit ghastly murders in a nightmare world of tilted, expressionist architectural shadows."
  },
  {
    title: "Nosferatu",
    year: 1922,
    genres: ["Horror"],
    rating: 7.9,
    votes: 104000,
    runtime: 94,
    director: "F.W. Murnau",
    overview: "Murnau's unauthorized silent adaptation of Dracula brings the rodent-like Count Orlok to plague a sleepy Baltic town."
  },
  {
    title: "Sunrise: A Song of Two Humans",
    year: 1927,
    genres: ["Drama", "Romance"],
    rating: 8.1,
    votes: 54000,
    runtime: 94,
    director: "F.W. Murnau",
    overview: "A married village farmer is seduced by a seductive city woman who urges him to drown his wife, only to experience an epiphany of devotion."
  },
  {
    title: "La Notte",
    year: 1961,
    genres: ["Drama"],
    rating: 7.9,
    votes: 24000,
    runtime: 122,
    director: "Michelangelo Antonioni",
    overview: "A prominent novelist and his disillusioned wife wander through Milan and an aristocratic all-night party as their marriage quietly dies."
  },
  {
    title: "L'Eclisse",
    year: 1962,
    genres: ["Drama", "Romance"],
    rating: 7.7,
    votes: 21000,
    runtime: 126,
    director: "Michelangelo Antonioni",
    overview: "A young literary translator breaks off an engagement and falls into an ephemeral affair with an energetic stockbroker in modern Rome."
  },
  {
    title: "Red Desert",
    year: 1964,
    genres: ["Drama"],
    rating: 7.5,
    votes: 18500,
    runtime: 117,
    director: "Michelangelo Antonioni",
    overview: "Antonioni uses radical industrial color palettes to explore a neurotic woman's alienation amid the chemical smog and petrochemical factories of Ravenna."
  },
  {
    title: "Contempt",
    year: 1963,
    genres: ["Drama", "Romance"],
    rating: 7.5,
    votes: 38000,
    runtime: 103,
    director: "Jean-Luc Godard",
    overview: "A French playwright hired to commercialize Fritz Lang's adaptation of The Odyssey observes the bitter, irreversible erosion of his marriage in Capri."
  },
  {
    title: "Band of Outsiders",
    year: 1964,
    genres: ["Comedy", "Crime", "Drama"],
    rating: 7.6,
    votes: 29000,
    runtime: 95,
    director: "Jean-Luc Godard",
    overview: "Two romantic Parisian rogues entice a shy young English student to help them steal a bundle of cash stashed in her aunt's villa."
  },
  {
    title: "Pierrot le Fou",
    year: 1965,
    genres: ["Action", "Adventure", "Crime"],
    rating: 7.5,
    votes: 39000,
    runtime: 110,
    director: "Jean-Luc Godard",
    overview: "Ferdinand abandons his bourgeois marriage and runs away to the sun-soaked South of France with his baby-sitter Marianne, who is hunted by OAS gunrunners."
  },
  {
    title: "Vivre Sa Vie",
    year: 1962,
    genres: ["Drama"],
    rating: 7.9,
    votes: 37000,
    runtime: 85,
    director: "Jean-Luc Godard",
    overview: "Godard organizes Nana's descent into prostitution in twelve tableaux, analyzing female autonomy, language, and economic survival."
  },
  {
    title: "Hiroshima Mon Amour",
    year: 1959,
    genres: ["Drama", "Romance"],
    rating: 7.8,
    votes: 39000,
    runtime: 90,
    director: "Alain Resnais",
    overview: "A French actress making an anti-war film in rebuilt Hiroshima has an affair with a Japanese architect, intertwining wartime memories."
  },
  {
    title: "Last Year at Marienbad",
    year: 1961,
    genres: ["Drama", "Mystery"],
    rating: 7.7,
    votes: 26000,
    runtime: 94,
    director: "Alain Resnais",
    overview: "In a grand European chateau resort, a mysterious stranger attempts to convince an enigmatic woman that they met and fell in love the previous year."
  },
  {
    title: "Wild Strawberries",
    year: 1957,
    genres: ["Drama", "Romance"],
    rating: 8.1,
    votes: 115000,
    runtime: 91,
    director: "Ingmar Bergman",
    overview: "An aging, bitter bacteriology professor travels to Lund to receive an honorary jubilee degree, reassessing his past failures through vivid daydreams."
  },
  {
    title: "Through a Glass Darkly",
    year: 1961,
    genres: ["Drama"],
    rating: 7.8,
    votes: 28000,
    runtime: 89,
    director: "Ingmar Bergman",
    overview: "A schizophrenic young woman vacations on an isolated Baltic island with her distant father, frustrated husband, and troubled younger brother."
  },
  {
    title: "Winter Light",
    year: 1963,
    genres: ["Drama"],
    rating: 7.9,
    votes: 25000,
    runtime: 81,
    director: "Ingmar Bergman",
    overview: "A small-town pastor struggling with a crippling crisis of faith ministers to an atheist schoolteacher and a fisherman tormented by nuclear dread."
  },
  {
    title: "The Silence",
    year: 1963,
    genres: ["Drama"],
    rating: 7.7,
    votes: 19500,
    runtime: 96,
    director: "Ingmar Bergman",
    overview: "Two emotionally estranged sisters and a young boy stay at an opulent hotel in a fictitious Central European city on the verge of military conflict."
  },
  {
    title: "Ali: Fear Eats the Soul",
    year: 1974,
    genres: ["Drama", "Romance"],
    rating: 8.0,
    votes: 38000,
    runtime: 93,
    director: "Rainer Werner Fassbinder",
    overview: "An elderly German cleaning woman falls in love with and marries a much younger Moroccan migrant mechanic, confronting ostracism from friends and family."
  },
  {
    title: "The Marriage of Maria Braun",
    year: 1979,
    genres: ["Drama"],
    rating: 7.7,
    votes: 18000,
    runtime: 120,
    director: "Rainer Werner Fassbinder",
    overview: "A determined German woman navigates postwar rubble and corporate recovery through calculated compromises while awaiting her husband's return from prison."
  },
  {
    title: "Fox and His Friends",
    year: 1975,
    genres: ["Drama"],
    rating: 7.7,
    votes: 9500,
    runtime: 123,
    director: "Rainer Werner Fassbinder",
    overview: "A working-class carnival entertainer wins the lottery, only to be financially and emotionally exploited by his bourgeois gay lover and entourage."
  },
  {
    title: "The Bitter Tears of Petra von Kant",
    year: 1972,
    genres: ["Drama"],
    rating: 7.6,
    votes: 14500,
    runtime: 124,
    director: "Rainer Werner Fassbinder",
    overview: "An arrogant fashion designer operates from her bedroom, tormenting her silent assistant while becoming obsessively infatuated with a cold aspiring model."
  },
  {
    title: "Fitzcarraldo",
    year: 1982,
    genres: ["Adventure", "Drama"],
    rating: 8.0,
    votes: 42000,
    runtime: 158,
    director: "Werner Herzog",
    overview: "An eccentric Irish opera lover attempts to finance an opera house in the Peruvian jungle by hauling a 320-ton steamship over a muddy mountain."
  },
  {
    title: "Stroszek",
    year: 1977,
    genres: ["Comedy", "Drama"],
    rating: 7.8,
    votes: 23000,
    runtime: 108,
    director: "Werner Herzog",
    overview: "An eccentric Berlin street busker, his elderly neighbor, and a prostitute emigrate to small-town Wisconsin, encountering suburban disillusionment."
  },
  {
    title: "The Enigma of Kaspar Hauser",
    year: 1974,
    genres: ["Biography", "Drama"],
    rating: 7.8,
    votes: 17000,
    runtime: 110,
    director: "Werner Herzog",
    overview: "A young man who spent his entire life chained in a dark cellar mysteriously appears in a Nuremberg square in 1828, speaking only a single phrase."
  },
  {
    title: "Celine and Julie Go Boating",
    year: 1974,
    genres: ["Comedy", "Drama", "Fantasy"],
    rating: 7.6,
    votes: 11000,
    runtime: 193,
    director: "Jacques Rivette",
    overview: "A magician and a librarian in Paris become entangled in an uncanny melodrama unfolding in a haunted suburban villa, eating magical candies to enter the plot."
  },
  {
    title: "Sans Soleil",
    year: 1983,
    genres: ["Documentary"],
    rating: 7.8,
    votes: 18500,
    runtime: 100,
    director: "Chris Marker",
    overview: "A woman reads letters sent by a globetrotting cameraman, contemplating memory, time, survival, and ritual across Tokyo, Guinea-Bissau, and San Francisco."
  },
  {
    title: "The Spirit of the Beehive",
    year: 1973,
    genres: ["Drama"],
    rating: 7.8,
    votes: 23500,
    runtime: 98,
    director: "Víctor Erice",
    overview: "In 1940 Castile following the Spanish Civil War, a quiet six-year-old girl becomes fascinated by Frankenstein's monster after seeing the traveling film."
  },
  {
    title: "El Sur",
    year: 1983,
    genres: ["Drama"],
    rating: 7.7,
    votes: 7500,
    runtime: 95,
    director: "Víctor Erice",
    overview: "A young woman in northern Spain pieces together memories of her mysterious, remote dowsing father and his mythic, sunlit past in the South."
  },
  {
    title: "Nostalghia",
    year: 1983,
    genres: ["Drama"],
    rating: 7.9,
    votes: 31000,
    runtime: 125,
    director: "Andrei Tarkovsky",
    overview: "A homesick Russian writer researching an eighteenth-century composer travels through Tuscany, bonding with an eccentric hermit who once locked his family inside."
  },
  {
    title: "The Sacrifice",
    year: 1986,
    genres: ["Drama"],
    rating: 7.9,
    votes: 27000,
    runtime: 149,
    director: "Andrei Tarkovsky",
    overview: "On a Baltic island, an intellectual promises God that he will give up his family, home, and voice to avert a looming nuclear apocalypse."
  },
  {
    title: "Ivan's Childhood",
    year: 1962,
    genres: ["Drama", "War"],
    rating: 8.0,
    votes: 42000,
    runtime: 95,
    director: "Andrei Tarkovsky",
    overview: "A twelve-year-old orphaned Russian boy works as a frontline reconnaissance scout on the Eastern Front, haunted by memories of his slain mother."
  }
];

// Ensure we have exactly 120 movies
const movies = rawList.slice(0, 120).map((m, index) => {
  const numStr = String(index + 1).padStart(3, '0');
  return {
    id: `kino-${numStr}`,
    title: m.title,
    year: m.year,
    genres: m.genres,
    rating: m.rating,
    votes: m.votes,
    runtime: m.runtime,
    director: m.director,
    poster: `/assets/posters/poster-${numStr}.jpg`,
    overview: m.overview
  };
});

fs.writeFileSync(
  path.resolve('./data/movies.json'),
  JSON.stringify(movies, null, 2),
  'utf8'
);

console.log(`Generated exactly ${movies.length} movies in data/movies.json.`);
