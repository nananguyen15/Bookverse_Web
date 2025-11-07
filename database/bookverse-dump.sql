-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: book_store
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `author`
--

DROP TABLE IF EXISTS `author`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `author` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` longtext COLLATE utf8mb4_unicode_ci,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `author`
--

LOCK TABLES `author` WRITE;
/*!40000 ALTER TABLE `author` DISABLE KEYS */;
INSERT INTO `author` VALUES (1,'/src/assets/img/author/rowling.webp','J.K. Rowling','Joanne Rowling, known by her pen name J. K. Rowling, is a British author and philanthropist. She is the author of Harry Potter, a seven-volume fantasy novel series published from 1997 to 2007. ',_binary ''),(2,'/src/assets/img/author/martin.webp','George R.R. Martin','George Raymond Richard Martin also known by the initials G.R.R.M. is an American author',_binary ''),(3,'/src/assets/img/author/murakami.webp','Haruki Murakami','Haruki Murakami is a Japanese writer. His novels',_binary ''),(4,'/src/assets/img/author/christie.webp','Agatha Christie','Dame Agatha Mary Clarissa Christie',_binary ''),(5,'/src/assets/img/author/danbrown.webp','Dan Brown','Daniel Gerhard Brown is an American writer best known for his thriller novels',_binary ''),(6,'/src/assets/img/author/conan.webp','Sir Arthur Conan Doyle','Sir Arthur Ignatius Conan Doyle was a British writer and physician. He created the character Sherlock Holmes in 1887 for A Study in Scarlet, the first of four novels and fifty-six short stories about Holmes and Dr. Watson. The Sherlock Holmes stories are milestones in the field of crime fiction.',_binary ''),(7,'/src/assets/img/author/rowling.webp','Nguyen Hoang Dat','ok',_binary '\0'),(9,'/src/assets/img/author/author-sample.webp','Kristin Hannah','Kristin Hannah was born in California. After graduating with a degree in communication from the University of Washington in 1983, Hannah worked at an advertising agency in Seattle. She graduated from the University of Puget Sound law school and practiced law in Seattle before becoming a full-time writer. Hannah wrote her first novel with her mother, who was dying of cancer at the time, but the book was never published.',_binary ''),(10,'/src/assets/img/author/author-sample.webp','Markus Zusak','Zusak was born in Sydney, Australia. His mother Lisa Zusak is originally from Germany and his father Helmut Zusak is Austrian. They immigrated to Australia in the late 1950s.[2][3] Zusak is the youngest of four children and has two sisters and one brother. He attended Engadine High School and briefly returned there to teach English while writing. He studied English and history at the University of New South Wales, graduating with a Bachelor of Arts and a Diploma of Education.',_binary ''),(11,'/src/assets/img/author/author-sample.webp','Min Jin Lee','Lee was born in Seoul, South Korea.[4] Her family immigrated to the United States in 1976, when she was seven years old. She was raised in Elmhurst, Queens, in New York City.[1][5] Her parents owned a wholesale jewelry store on 30th Street and Broadway in Koreatown, Manhattan. As a new immigrant, she spent much time at the Queens Public Library, where she learned to read and write.',_binary ''),(12,'/src/assets/img/author/author-sample.webp','Amor Towles','Towles was born and raised in Boston, to Stokley Porter Towles, an investment banker at Brown Brothers Harriman and a philanthropist, and Holly Hollingsworth. His parents later divorced. He has a brother, Stokley Jr.; a sister, Kimbrough; and two stepbrothers.[4] When Towles was 10 years old, he threw a bottle with a message into the Atlantic Ocean. Several weeks later, he received a letter from Harrison Salisbury, then managing editor of The New York Times, who had found the bottle. Towles and Salisbury corresponded for many years afterward.',_binary ''),(13,'/src/assets/img/author/author-sample.webp','Madeline Miller','Miller was born on July 24, 1978, in Boston and grew up in New York City and Philadelphia.',_binary ''),(14,'/src/assets/img/author/author-sample.webp','Khaled Hosseini','Khaled Hosseini is a writer who was born in Afghanistan but came to the United States when he was fifteen years old. He is best known for his first novel, The Kite Runner, which was first published in 2003. His second novel was published in 2007. In 2013 And the Mountains Echoed was published.',_binary ''),(15,'/src/assets/img/author/author-sample.webp','Ursula K. Le Guin','Le Guin was born in Berkeley, California, to author Theodora Kroeber and anthropologist Alfred Louis Kroeber. Having earned a master\'s degree in French, Le Guin began doctoral studies but abandoned these after her marriage in 1953 to historian Charles Le Guin. She began writing full-time in the late 1950s, and she achieved major critical and commercial success with the novels A Wizard of Earthsea (1968) and The Left Hand of Darkness (1969)',_binary ''),(16,'/src/assets/img/author/author-sample.webp','Kazuo Ishiguro','Ishiguro was born in Nagasaki, Japan, and moved to Britain in 1960 with his parents when he was five. His first two novels, A Pale View of Hills and An Artist of the Floating World, were noted for their explorations of Japanese identity and their mournful tone. He thereafter explored other genres, including science fiction and historical fiction.',_binary ''),(17,'/src/assets/img/author/author-sample.webp','Emily St. John Mandel','When she was ten years old, she moved with her parents and four siblings to Denman Island, which is 20 miles (32 km) south of Merville near Union Bay.',_binary ''),(18,'/src/assets/img/author/author-sample.webp','Stieg Larsson','He was the second-best-selling fiction author in the world for 2008, owing to the success of the English translation of The Girl with the Dragon Tattoo, behind Afghan-American novelist Khaled Hosseini.',_binary ''),(19,'/src/assets/img/author/author-sample.webp','Agatha Christie','A writer during the \"Golden Age of Detective Fiction\", Christie has been called the \"Queen of Crime\"—a nickname now trademarked by her estate—or the \"Queen of Mystery\".[3][4] She wrote the world\'s longest-running play, the murder mystery The Mousetrap, which has been performed in the West End of London since 1952. She also wrote six novels under the pseudonym Mary Westmacott. In 1971, she was made a Dame (DBE) by Queen Elizabeth II for her contributions to literature. She is the best-selling fiction writer of all time, her novels having sold more than two billion copies',_binary ''),(20,'/src/assets/img/author/author-sample.webp','Arthur Conan Doyle','Doyle was a prolific writer. In addition to the Holmes stories, his works include fantasy and science fiction stories about Professor Challenger, and humorous stories about the Napoleonic soldier Brigadier Gerard, as well as plays, romances, poetry, non-fiction, and historical novels. One of Doyle\'s early short stories, \"J. Habakuk Jephson\'s Statement\" (1884), helped to popularise the mystery of the brigantine Mary Celeste, found drifting at sea with no crew member aboard.',_binary ''),(21,'/src/assets/img/author/author-sample.webp','Alexander McCall Smith','Sir Alexander \"Sandy\" McCall Smith CBE FRSE FRSL (born 24 August 1948) is a Scottish legal scholar and author of fiction. He was raised in Southern Rhodesia (now Zimbabwe) and was formerly Professor of Medical Law at the University of Edinburgh. He became an expert on medical law and bioethics and served on related British and international committees. He has since become known as a fiction writer, with sales in English exceeding 40 million by 2010 and translations into 46 languages.',_binary ''),(22,'/src/assets/img/author/author-sample.webp','Louise Penny','Penny left the CBC in 1996 to take up writing.[7] She started a historical novel but had difficulty finishing it and eventually switched to mystery writing.[7] She entered her first novel, Still Life, in the \"Debut Dagger\" competition in the United Kingdom, placing second out of 800 entries.[7] The novel won other awards, including the \"New Blood\" Dagger award in the United Kingdom, the Arthur Ellis Award in Canada for best first crime novel, the Dilys Award,[8] the Anthony Award and the Barry Award for Best First Novel in the United States.',_binary ''),(23,'/src/assets/img/author/author-sample.webp','Laura Childs','Laura Childs is the New York Times bestselling author of the Cackleberry Club, Tea Shop and Scrapbooking mysteries.',_binary ''),(24,'/src/assets/img/author/author-sample.webp','Tana French','Tana French (born 10 May 1973) ',_binary ''),(25,'/src/assets/img/author/author-sample.webp','Michael Connelly','At age 12 Connelly moved with his family from Philadelphia to Fort Lauderdale, Florida, where he attended St Thomas Aquinas High School. At age 16 Connelly\'s interest in crime and mystery escalated when, on his way home from his work as a hotel dishwasher, he witnessed a man throw an object into a hedge. Connelly decided to investigate and found that the object was a gun wrapped in a lumberjack shirt. After putting the gun back he followed the man to a bar and then left to go home to tell his father. Later that night Connelly brought the police down to the bar but the man was already gone. This event introduced Connelly to the world of police officers and their lives, impressing him with the way they worked.',_binary ''),(26,'/src/assets/img/author/author-sample.webp','Alex Michaelides','He studied psychotherapy for three years, and worked for two years at Northgate Clinic Adolescent unit, a mental health service for adolescents experiencing complex mental illness. This work provided material and inspiration for his debut novel The Silent Patient.',_binary ''),(27,'/src/assets/img/author/author-sample.webp','George R.R. Martin','He is best known as the author of the series of epic fantasy novels A Song of Ice and Fire, which were adapted into the Primetime Emmy Award–winning television series Game of Thrones (2011–2019) and its prequel series House of the Dragon (2022–present). He also helped create the Wild Cards anthology series and contributed worldbuilding for the video game Elden Ring (2022).',_binary ''),(28,'/src/assets/img/author/author-sample.webp','Patrick Rothfuss','Patrick James Rothfuss (born June 6',_binary ''),(29,'/src/assets/img/author/author-sample.webp','Brandon Sanderson','Brandon Winn Sanderson (born December 19, 1975) is an American author of high fantasy, science fiction, and young adult books. He is best known for the Cosmere fictional universe, in which most of his fantasy novels, most notably the Mistborn series and The Stormlight Archive, are set. Outside of the Cosmere, he has written several young adult and juvenile series including The Reckoners, the Skyward series,[a] and the Alcatraz series. He is also known for finishing author Robert Jordan\'s high fantasy series The Wheel of Time. Sanderson has created two graphic novels, including White Sand and Dark One.',_binary ''),(30,'/src/assets/img/author/author-sample.webp',' Neil Gaiman            ',' English author (b. 1960). Writes across fantasy, comics, children’s fiction and adult novels; known for imaginative, mythic storytelling (*Neverwhere*, *Sandman*). ',_binary ''),(31,'/src/assets/img/author/author-sample.webp',' Patricia Briggs        ',' American fantasy author (b. 1965). Writes urban fantasy and paranormal series featuring shapeshifters and practical heroines (e.g., Mercy Thompson series).         ',_binary ''),(32,'/src/assets/img/author/author-sample.webp',' Ben Aaronovitch        ',' British author (b. 1964). Writes urban fantasy with a comic/ procedural bent; creator of the *Rivers of London* series.                                             ',_binary ''),(33,'/src/assets/img/author/author-sample.webp',' Scott Lynch            ',' American fantasy novelist (b. 1978). Debuted with *The Lies of Locke Lamora*, known for witty caper plots in gritty fantasy settings.                               ',_binary ''),(34,'/src/assets/img/author/author-sample.webp',' Mark Lawrence          ',' British-American fantasy author (b. 1966). Writes dark, often morally complex fantasy (e.g., *Prince of Thorns*).                                                   ',_binary ''),(35,'/src/assets/img/author/author-sample.webp',' N. K. Jemisin          ',' American speculative fiction author (b. 1972). Multi-Hugo Award winner known for inventive worldbuilding and social themes (*The Fifth Season*).                    ',_binary ''),(36,'/src/assets/img/author/author-sample.webp',' Helen Hoang            ',' American romance novelist (b. 1982). Writes contemporary romance often featuring neurodiversity and diverse leads (e.g., *The Kiss Quotient*).                      ',_binary ''),(37,'/src/assets/img/author/author-sample.webp',' Jojo Moyes             ',' British author and journalist (b. 1969). Writes contemporary romance and drama; bestselling author of *Me Before You*.                                              ',_binary ''),(38,'/src/assets/img/author/author-sample.webp',' Emily Henry            ',' American author. Contemporary romance novelist known for witty, emotionally resonant beach-read style (*Beach Read*).                                               ',_binary ''),(39,'/src/assets/img/author/author-sample.webp',' Diana Gabaldon         ',' American author (b. 1952). Creator of the *Outlander* series which blends historical fiction, time travel and romance.                                              ',_binary ''),(40,'/src/assets/img/author/author-sample.webp',' Tessa Dare             ',' Contemporary romance author. Writes lighthearted historical/regency romances with humor and strong heroines.                                                        ',_binary ''),(41,'/src/assets/img/author/author-sample.webp',' Julia Quinn            ',' American romance novelist (b. 1970). Known for Regency-era historical romances, notably the *Bridgerton* series.                                                    ',_binary ''),(42,'/src/assets/img/author/author-sample.webp',' J.R. Ward              ',' American author (b. 1969). Writes paranormal romance and urban fantasy; creator of the Black Dagger Brotherhood vampire series.                                     ',_binary ''),(43,'/src/assets/img/author/author-sample.webp',' Stephenie Meyer        ',' American author (b. 1973). Best known for the *Twilight* vampire romance series that sparked a major YA phenomenon.                                                 ',_binary ''),(44,'/src/assets/img/author/author-sample.webp',' Deborah Harkness       ',' American scholar and novelist (b. 1965). Historian of science and author of the *All Souls* series blending history, magic and romance.                             ',_binary ''),(45,'/src/assets/img/author/author-sample.webp',' Gillian Flynn          ',' American novelist and former entertainment reporter (b. 1971). Writes dark psychological thrillers such as *Gone Girl*.                                             ',_binary ''),(46,'/src/assets/img/author/author-sample.webp',' Paula Hawkins          ',' British author (b. 1972). Former journalist who writes suspense novels; gained fame with *The Girl on the Train*.                                                   ',_binary ''),(47,'/src/assets/img/author/author-sample.webp',' Dan Brown              ',' American author (b. 1964). Writes fast-paced thrillers about art, symbols and conspiracies; best known for *The Da Vinci Code*.                                     ',_binary ''),(48,'/src/assets/img/author/author-sample.webp',' Robert Ludlum          ',' American thriller writer (1927–2001). Prolific creator of espionage thrillers including the original *Bourne* novels.                                               ',_binary ''),(49,'/src/assets/img/author/author-sample.webp',' Lee Child              ',' British-American author (b. 1954). Creator of the Jack Reacher series of action thrillers.                                                                          ',_binary ''),(50,'/src/assets/img/author/author-sample.webp',' Terry Hayes            ',' British-Australian novelist and screenwriter. Wrote the bestselling geopolitical thriller *I Am Pilgrim*.                                                           ',_binary '');
/*!40000 ALTER TABLE `author` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL,
  `author_id` bigint DEFAULT NULL,
  `publisher_id` bigint DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `published_date` date DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `books_author_fk` (`author_id`),
  KEY `books_publisher_fk` (`publisher_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `book_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `sub_category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `books_author_fk` FOREIGN KEY (`author_id`) REFERENCES `author` (`id`),
  CONSTRAINT `books_publisher_fk` FOREIGN KEY (`publisher_id`) REFERENCES `publisher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book`
--

LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;
INSERT INTO `book` VALUES (1,'Philosopher\'s Stone','The beginning of Harry’s magical journey. An orphaned boy discovers he’s a wizard and attends Hogwarts School of Witchcraft and Wizardry',10.99,1,1,1,50,'1997-06-26','/src/assets/img/book/hp1.webp',_binary ''),(2,'Harry Potter and the Chamber of Secrets','Harry returns for his second year at Hogwarts',11.99,1,1,1,50,'1998-07-02','/src/assets/img/book/hp2.webp',_binary '\0'),(3,'Harry Potter and the Prisoner of Azkaban','Sirius Black, a feared prisoner, escapes from Azkaban, and everyone believes he’s after Harry. As truths about his parents’ past unfold, Harry finds strength in unexpected allies.',12.99,1,1,1,50,'1999-07-08','/src/assets/img/book/hp3.webp',_binary ''),(4,'Harry Potter and the Goblet of Fire','Harry is unexpectedly chosen for the dangerous Triwizard Tournament. Amid thrilling challenges, Voldemort’s return marks a darker turn for the wizarding world.',13.99,1,1,1,50,'2000-07-08','/src/assets/img/book/hp4.webp',_binary '\0'),(5,'Harry Potter and the Order of the Phoenix','The Ministry denies Voldemort’s return, leading Harry to form “Dumbledore’s Army” to fight back. Rebellion grows at Hogwarts under Umbridge’s rule as danger looms.',14.99,1,1,1,50,'2003-06-21','/src/assets/img/book/hp5.webp',_binary ''),(6,'Harry Potter and the Half-Blood Prince','Dumbledore reveals Voldemort’s past to Harry. Love, loss, and betrayal shape the coming war.',15.99,1,1,1,50,'2005-07-16','/src/assets/img/book/hp6.webp',_binary ''),(7,'Harry Potter and the Deathly Hallows','Harry, Ron, and Hermione search for Horcruxes in the final battle against Voldemort.',16.99,1,1,1,50,'2007-07-21','/src/assets/img/book/hp7.webp',_binary ''),(8,'A Game of Thrones','In the Seven Kingdoms of Westeros, noble houses battle for power as winter approaches. A sprawling tale of politics, war, and prophecy begins.',16.99,2,2,1,100,'1996-08-06','/src/assets/img/book/got1.webp',_binary '\0'),(9,'A Clash of Kings','The Iron Throne is contested as multiple kings rise. Wars rage, alliances shift, and dark powers stir beyond the Wall.',16.99,2,2,1,100,'1998-11-16','/src/assets/img/book/got2.webp',_binary ''),(10,'A Storm of Swords','Betrayals and battles shape the realm. The Night’s Watch faces danger in the North, and shocking twists redefine the war for the throne.',16.99,2,2,1,100,'2000-08-08','/src/assets/img/book/got3.webp',_binary ''),(11,'A Feast for Crows','After civil war, Westeros struggles to rebuild. Schemes and plots dominate as new players emerge and old powers weaken.',16.99,2,2,1,100,'2005-11-08','/src/assets/img/book/got4.webp',_binary ''),(12,'A Dance with Dragons','Power struggles continue as Daenerys rules in Meereen, Jon Snow leads at the Wall, and new threats rise across the Narrow Sea.',16.99,2,2,1,100,'2011-07-12','/src/assets/img/book/got5.webp',_binary ''),(13,'Norwegian Wood','A nostalgic and deeply emotional coming-of-age novel set in 1960s Tokyo. Toru Watanabe reflects on his university years, marked by love, loss, and the search for meaning. Known for its quiet intensity and beautifully simple prose, it remains one of Murakami’s most beloved works.',13.99,3,3,3,150,'1987-09-04','/src/assets/img/book/norwegian-wood.webp',_binary ''),(14,'Murder on the Orient Express','A classic detective novel featuring Hercule Poirot. When a wealthy American is found murdered aboard the luxurious Orient Express, every passenger becomes a suspect. Poirot must unravel a web of secrets and alibis to expose the killer in one of Christie’s most famous and brilliantly plotted mysteries.',9.99,4,4,2,200,'1934-01-01','/src/assets/img/book/orientexpress.webp',_binary ''),(15,'The Da Vinci Code','A fast-paced historical thriller that follows symbologist Robert Langdon as he uncovers a hidden trail of clues left in famous artworks and cathedrals. When a murder occurs in the Louvre',10.99,5,5,4,250,'2003-03-18','/src/assets/img/book/davinci.webp',_binary ''),(16,'A Study in Scarlet','The first appearance of Sherlock Holmes and Dr. Watson',10.99,6,6,2,300,'1887-10-20','/src/assets/img/book/sl1.webp',_binary ''),(17,'The Sign of the Four','Holmes and Watson investigate a complex plot involving hidden treasure, betrayal, and the Andaman convicts.',10.99,6,6,2,300,'1890-10-20','/src/assets/img/book/sl2.webp',_binary ''),(18,'The Adventures of Sherlock Holmes','A collection of 12 short stories that established Holmes’s fame',10.99,6,6,2,300,'1892-10-20','/src/assets/img/book/sl3.webp',_binary ''),(19,'The Memoirs of Sherlock Holmes','Another 11 short stories, including “The Final Problem,” where Holmes faces Professor Moriarty.',10.99,6,6,2,300,'1893-10-20','/src/assets/img/book/sl4.webp',_binary ''),(20,'The Hound of the Baskervilles','One of Holmes’s most famous cases — a gothic thriller set on Dartmoor involving a legendary demonic hound.',10.99,6,6,2,300,'1902-10-20','/src/assets/img/book/sl5.webp',_binary ''),(21,'The Return of Sherlock Holmes','Holmes reappears after being presumed dead and solves more complex London mysteries.',10.99,6,6,2,300,'1905-10-20','/src/assets/img/book/sl6.webp',_binary ''),(22,'His Last Bow','Stories spanning Holmes’s later career',10.99,6,6,2,300,'1917-10-20','/src/assets/img/book/sl7.webp',_binary '\0'),(23,'The Case-Book of Sherlock Holmes','The final collection of 12 stories',10.99,6,6,2,300,'1927-10-20','/src/assets/img/book/sl8.webp',_binary ''),(43,' The Nightingale           ',' Two sisters in Nazi-occupied France take different paths of survival, resistance, love, and loss. ',13.99,9,1,6,1000,'2000-01-01','/src/assets/img/book/b1.webp',_binary ''),(44,' The Book Thief            ',' Narrated by Death, a young girl’s life in Nazi Germany reveals the power of words and books.      ',14.99,10,1,6,1000,'2000-01-01','/src/assets/img/book/b2.webp',_binary ''),(45,' Pachinko                  ',' A Korean family’s multi-generational saga of identity, love, and survival in Japan.               ',15.99,11,1,6,1000,'2000-01-01','/src/assets/img/book/b3.webp',_binary ''),(46,' A Gentleman in Moscow     ',' A Russian count lives under house arrest in a grand hotel while history unfolds outside.          ',16.99,12,1,7,1000,'2000-01-01','/src/assets/img/book/b4.webp',_binary ''),(47,' The Song of Achilles      ',' A retelling of Achilles and Patroclus’s bond through myth, love, and war.                         ',16.99,13,1,7,1000,'2000-01-01','/src/assets/img/book/b5.webp',_binary ''),(48,' The Kite Runner           ',' A story of friendship, betrayal, and redemption set in Afghanistan’s turbulent history.           ',16.99,14,1,7,1000,'2000-01-01','/src/assets/img/book/b6.webp',_binary ''),(49,' The Left Hand of Darkness ',' A lone envoy on a gender-fluid planet must bridge vast cultural and political divides.            ',16.99,15,1,8,1000,'2000-01-01','/src/assets/img/book/b7.webp',_binary ''),(50,' Never Let Me Go           ',' Clones raised for organ donation struggle with love, purpose, and humanity.                       ',16.99,16,2,8,1000,'2000-01-01','/src/assets/img/book/b8.webp',_binary ''),(51,' Station Eleven            ',' A post-pandemic world where a traveling troupe preserves art and hope.                            ',16.99,17,2,8,1000,'2000-01-01','/src/assets/img/book/b9.webp',_binary ''),(52,' The Girl with the Dragon Tattoo    ',' A journalist and hacker investigate a decades-old disappearance in Sweden.      ',16.99,18,2,9,1000,'2000-01-01','/src/assets/img/book/b10.webp',_binary ''),(53,' Murder on the Orient Express       ',' Hercule Poirot solves a murder aboard a snowbound luxury train.                 ',16.99,19,2,9,1000,'2000-01-01','/src/assets/img/book/b11.webp',_binary ''),(54,' The Hound of the Baskervilles      ',' Sherlock Holmes investigates a deadly curse haunting the Baskerville family.    ',16.99,20,2,9,1000,'2000-01-01','/src/assets/img/book/b12.webp',_binary ''),(55,' The No. 1 Ladies’ Detective Agency ',' Botswana’s first female detective solves charming, everyday mysteries.          ',16.99,21,3,10,1000,'2000-01-01','/src/assets/img/book/b13.webp',_binary ''),(56,' Still Life                         ',' Inspector Gamache investigates a suspicious death in a peaceful Quebec village. ',16.99,22,4,10,1000,'2000-01-01','/src/assets/img/book/b14.webp',_binary ''),(57,' Death by Darjeeling                ',' A tea shop owner in Charleston gets involved in a murder case.                  ',16.99,23,5,10,1000,'2000-01-01','/src/assets/img/book/b15.webp',_binary ''),(58,' In the Woods                       ',' A detective revisits his traumatic past while solving a child’s murder.         ',13.99,24,6,11,1000,'2000-01-01','/src/assets/img/book/b16.webp',_binary ''),(59,' The Black Echo                     ',' Harry Bosch uncovers secrets tied to a veteran’s suspicious death.              ',9.99,25,6,11,1000,'2000-01-01','/src/assets/img/book/b17.webp',_binary ''),(60,' The Silent Patient                 ',' A psychotherapist investigates why a painter stopped speaking after murder.     ',10.99,26,6,11,1000,'2000-01-01','/src/assets/img/book/b18.webp',_binary ''),(61,' A Game of Thrones        ',' Rival families battle for power in a world of dragons and deceit.        ',10.99,27,6,12,1000,'2000-01-01','/src/assets/img/book/b19.webp',_binary ''),(62,' The Name of the Wind     ',' A gifted boy becomes a legendary wizard through hardship and learning.   ',10.99,28,6,12,1000,'2000-01-01','/src/assets/img/book/b20.webp',_binary ''),(63,' The Way of Kings         ',' Warriors and scholars struggle to unite a world ravaged by storms.       ',10.99,29,6,12,1000,'2000-01-01','/src/assets/img/book/b21.webp',_binary ''),(64,' Neverwhere               ',' A man discovers a hidden, magical London beneath the city streets.       ',10.99,30,6,13,1000,'2000-01-01','/src/assets/img/book/b22.webp',_binary ''),(65,' Moon Called              ',' A shapeshifting mechanic is drawn into supernatural politics and danger. ',10.99,31,6,13,1000,'2000-01-01','/src/assets/img/book/b23.webp',_binary ''),(66,' Rivers of London         ',' A young cop becomes a wizard’s apprentice in modern magical London.      ',10.99,32,1,13,1000,'2000-01-01','/src/assets/img/book/b24.webp',_binary ''),(67,' The Lies of Locke Lamora ',' A group of thieves face revenge and power struggles in a magical city.   ',10.99,33,1,14,1000,'2000-01-01','/src/assets/img/book/b25.webp',_binary ''),(68,' Prince of Thorns         ',' A ruthless prince seeks vengeance in a violent, shattered world.         ',10.99,34,1,14,1000,'2000-01-01','/src/assets/img/book/b26.webp',_binary ''),(69,' The Fifth Season         ',' Women with earth-shaping powers fight to survive a dying world.          ',13.99,35,1,14,1000,'2000-01-01','/src/assets/img/book/b27.webp',_binary ''),(70,' The Kiss Quotient      ',' A woman with autism hires an escort to learn about relationships and finds love. ',14.99,36,1,15,1000,'2000-01-01','/src/assets/img/book/b28.webp',_binary ''),(71,' Me Before You          ',' A caregiver transforms the life of a paralyzed man—and her own.                  ',16.99,37,1,15,1000,'2000-01-01','/src/assets/img/book/b29.webp',_binary ''),(72,' Beach Read             ',' Two rival authors make a bet that blurs the line between love and fiction.       ',16.99,38,1,15,1000,'2000-01-01','/src/assets/img/book/b30.webp',_binary ''),(73,' Outlander              ',' A WWII nurse time-travels to 18th-century Scotland and falls in love.            ',16.99,39,2,16,1000,'2000-01-01','/src/assets/img/book/b31.webp',_binary ''),(74,' The Duchess Deal       ',' A scarred duke and a seamstress marry for convenience and find love.             ',16.99,40,2,16,1000,'2000-01-01','/src/assets/img/book/b32.webp',_binary ''),(75,' When He Was Wicked     ',' A Regency bride and groom find passion amid wit and society.                     ',16.99,41,2,16,1000,'2000-01-01','/src/assets/img/book/b33.webp',_binary ''),(76,' Dark Lover             ',' A vampire warrior falls for a human woman amid war and desire.                   ',16.99,42,2,17,1000,'2000-01-01','/src/assets/img/book/b34.webp',_binary ''),(77,' Twilight               ',' A teenage girl falls for a vampire, facing forbidden love and danger.            ',13.99,43,2,17,1000,'2000-01-01','/src/assets/img/book/b35.webp',_binary ''),(78,' A Discovery of Witches ',' A witch and vampire uncover a magical manuscript that binds their fates.         ',9.99,44,3,17,1000,'2000-01-01','/src/assets/img/book/b36.webp',_binary ''),(79,' The Silent Patient              ',' A painter murders her husband and goes mute—her therapist seeks the truth.  ',10.99,45,4,18,1000,'2000-01-01','/src/assets/img/book/b.webp',_binary ''),(80,' Gone Girl                       ',' A missing wife’s disappearance reveals dark secrets and manipulation.       ',10.99,43,5,18,1000,'2000-01-01','/src/assets/img/book/b38.webp',_binary ''),(81,' The Girl on the Train           ',' A commuter becomes entangled in a missing-person mystery she witnesses.     ',10.99,44,6,18,1000,'2000-01-01','/src/assets/img/book/b39.webp',_binary ''),(82,' The Da Vinci Code               ',' A symbologist races across Europe to uncover a religious conspiracy.        ',10.99,45,6,19,1000,'2000-01-01','/src/assets/img/book/b40.webp',_binary ''),(83,' The Bourne Identity             ',' An amnesiac assassin hunts for his past while being hunted himself.         ',10.99,46,6,19,1000,'2000-01-01','/src/assets/img/book/b41.webp',_binary ''),(84,' One Shot                        ',' Jack Reacher investigates a sniper’s crime and uncovers a larger plot.      ',10.99,47,6,19,1000,'2000-01-01','/src/assets/img/book/b42.webp',_binary ''),(85,' The Girl with the Dragon Tattoo ',' A journalist and hacker expose corruption in a powerful Swedish family.     ',10.99,48,6,20,1000,'2000-01-01','/src/assets/img/book/b.webp',_binary ''),(86,' The Reversal                    ',' A prosecutor and ex-defense lawyer revisit a child murder case.             ',10.99,49,6,20,1000,'2000-01-01','/src/assets/img/book/b44.webp',_binary ''),(87,' I Am Pilgrim                    ',' A retired spy tracks a terrorist across the globe in a high-stakes pursuit. ',10.99,50,6,20,1000,'2000-01-01','/src/assets/img/book/b45.webp',_binary '');
/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_user_fk` (`user_id`),
  CONSTRAINT `carts_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,'0d026e17-a295-4ed3-ba8b-eafa385a5e49',_binary ''),(2,'30e8bca8-23a0-4c5e-bb60-d03b5e22c0f3',_binary ''),(3,'319ac3b6-69bf-43b8-8acf-7ac19c93eafe',_binary ''),(4,'337710c7-ff88-4d63-a3e5-64c1e40df725',_binary ''),(5,'424544a6-5fbf-4ec7-bb0e-ea3047982384',_binary ''),(6,'46532aef-6159-4800-ba74-308518741c4f',_binary ''),(7,'4c72ece6-bba7-41b5-b2bf-9c01340763de',_binary ''),(8,'79e6981d-369d-4ad1-bcdd-01ab085aa0da',_binary ''),(9,'7ecb6318-044e-4b69-8133-4b26b1d8a980',_binary ''),(10,'c3417234-e73d-412c-83f2-cdc2d75969db',_binary ''),(11,'e10e0048-4498-4f86-a478-0004a3ee31aa',_binary ''),(12,'f4a3d59d-1c18-4beb-9396-c55173bf2fc2',_binary ''),(13,'ff00dd10-6cd5-4482-a10b-505afeba427a',_binary '');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `book_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_items_cart_fk` (`cart_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `cart_item_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`),
  CONSTRAINT `cart_items_cart_fk` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (1,1,1,5),(2,2,1,5),(3,3,1,5),(4,4,1,5),(5,5,1,5),(6,6,1,5),(8,8,1,5),(9,9,1,5),(10,10,1,5),(11,11,1,5),(12,12,1,5),(13,13,1,5),(14,1,3,2),(15,2,3,2),(16,3,3,2),(17,4,3,2),(18,5,3,2),(19,6,3,2),(20,7,3,2),(21,8,3,2),(22,9,3,2),(23,10,3,2),(24,11,3,2),(25,12,3,2),(26,13,3,2),(27,7,1,5);
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_user_fk` (`user_id`),
  CONSTRAINT `notifications_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `status` enum('PENDING','PAID','SHIPPED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `total_amount` double NOT NULL,
  `address` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_ibfk_1` (`user_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint DEFAULT NULL,
  `book_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`),
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_token`
--

DROP TABLE IF EXISTS `otp_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `used` bit(1) NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDXeads5ru9yk3keyn0vn9s1vyui` (`email`),
  KEY `IDXryp41v8x3qjb1dkv75fjkwu8u` (`email`,`used`,`expires_at`),
  KEY `IDXoo1ko324ynywmil1wpq9oiyll` (`user_id`,`used`,`expires_at`),
  KEY `idx_otp_user_id` (`user_id`),
  CONSTRAINT `otp_token_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_token`
--

LOCK TABLES `otp_token` WRITE;
/*!40000 ALTER TABLE `otp_token` DISABLE KEYS */;
INSERT INTO `otp_token` VALUES (33,'716800','2025-11-01 09:47:23.661516','datnhce180797@fpt.edu.vn','2025-11-01 09:52:23.661516','SIGNUP',_binary '','4c72ece6-bba7-41b5-b2bf-9c01340763de'),(34,'897294','2025-11-01 09:50:08.712280','datnhce180797@fpt.edu.vn','2025-11-01 09:55:08.712280','SIGNUP',_binary '','4c72ece6-bba7-41b5-b2bf-9c01340763de'),(35,'775695','2025-11-01 09:58:21.717632','datnhce180797@fpt.edu.vn','2025-11-01 10:03:21.717632','SIGNUP',_binary '','4c72ece6-bba7-41b5-b2bf-9c01340763de'),(36,'809245','2025-11-02 14:02:46.772446','mackereldaz@gmail.com','2025-11-02 14:07:46.772446','SIGNUP',_binary '','46532aef-6159-4800-ba74-308518741c4f');
/*!40000 ALTER TABLE `otp_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint DEFAULT NULL,
  `method` enum('COD','MOMO','VNPAY','BANK_TRANSFER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion`
--

DROP TABLE IF EXISTS `promotion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentage` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion`
--

LOCK TABLES `promotion` WRITE;
/*!40000 ALTER TABLE `promotion` DISABLE KEYS */;
INSERT INTO `promotion` VALUES (1,'2025 November discount',20,'2025-11-01','2025-11-30','ok'),(2,'2025 Chrismas discount',50,'2025-12-23','2025-12-25','ok'),(3,'2026 Tet discount',50,'2026-02-10','2026-02-22','ok');
/*!40000 ALTER TABLE `promotion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publisher`
--

DROP TABLE IF EXISTS `publisher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publisher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` bit(1) NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publisher`
--

LOCK TABLES `publisher` WRITE;
/*!40000 ALTER TABLE `publisher` DISABLE KEYS */;
INSERT INTO `publisher` VALUES (1,'Bloomsbury Publishing',_binary '','London, UK','/src/assets/img/publisher/bloomsbury.webp'),(2,'Bantam Books',_binary '','New York, USA','/src/assets/img/publisher/bantam.webp'),(3,'Shinchōsha Publishing',_binary '','Tokyo, Japan','/src/assets/img/publisher/shinchosha.webp'),(4,'HarperCollins',_binary '','New York, USA','/src/assets/img/publisher/harpercollins.webp'),(5,'Doubleday',_binary '','New York, USA','/src/assets/img/publisher/doubleday.webp'),(6,'George Newnes Ltd',_binary '','London, UK','/src/assets/img/publisher/georgenewnes.webp');
/*!40000 ALTER TABLE `publisher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `book_id` bigint DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'thay cho active',
  PRIMARY KEY (`id`),
  KEY `reviews_ibfk_1` (`user_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`),
  CONSTRAINT `review_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series`
--

DROP TABLE IF EXISTS `series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `series` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `active` bit(1) NOT NULL,
  `author` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series`
--

LOCK TABLES `series` WRITE;
/*!40000 ALTER TABLE `series` DISABLE KEYS */;
INSERT INTO `series` VALUES (1,'Harry Potter','A series of fantasy novels.',_binary '','J.K. Rowling',NULL),(2,'A Song of Ice and Fire','Epic fantasy series.',_binary '','George R.R. Martin',NULL),(3,'Sherlock Holmes','An English detective fiction.',_binary '','Sir Arthur Conan Doyle',NULL);
/*!40000 ALTER TABLE `series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series_book`
--

DROP TABLE IF EXISTS `series_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `series_book` (
  `series_id` bigint NOT NULL,
  `book_id` bigint NOT NULL,
  PRIMARY KEY (`series_id`,`book_id`),
  KEY `series_books_ibfk_2` (`book_id`),
  CONSTRAINT `series_book_ibfk_1` FOREIGN KEY (`series_id`) REFERENCES `series` (`id`),
  CONSTRAINT `series_book_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series_book`
--

LOCK TABLES `series_book` WRITE;
/*!40000 ALTER TABLE `series_book` DISABLE KEYS */;
INSERT INTO `series_book` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(2,8),(2,9),(2,10),(2,11),(2,12),(3,16),(3,17),(3,18),(3,19),(3,20),(3,21),(3,22),(3,23);
/*!40000 ALTER TABLE `series_book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_category`
--

DROP TABLE IF EXISTS `sub_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sup_cat_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `promotion_id` bigint NOT NULL,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sub_category_sup_category_id_fk` (`sup_cat_id`),
  KEY `sub_category_promotion_id_fk` (`promotion_id`),
  CONSTRAINT `sub_category_promotion_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`),
  CONSTRAINT `sub_category_sup_category_id_fk` FOREIGN KEY (`sup_cat_id`) REFERENCES `sup_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_category`
--

LOCK TABLES `sub_category` WRITE;
/*!40000 ALTER TABLE `sub_category` DISABLE KEYS */;
INSERT INTO `sub_category` VALUES (1,3,'High Fantasy','High Fantasy is set in fully imagined worlds with their own histories, magic systems, and epic quests. It often features mythical creatures, ancient prophecies, and complex political or moral struggles. Readers are immersed in grand adventures where heroes rise against powerful forces.',1,_binary ''),(2,2,'Detective','Detective fiction centers on solving a crime or unraveling a mystery through investigation and sharp reasoning. A detective—professional or amateur—follows clues, interviews suspects, and ultimately reveals the truth. Suspense and clever plotting are key elements.',1,_binary ''),(3,1,'Magical Realism','Magical Realism blends realistic, everyday settings with subtle magical or supernatural elements that characters treat as normal. The genre often explores cultural identity, emotion, and myth through lyrical storytelling.',1,_binary ''),(4,5,'Historical Thriller','Historical Thrillers weave suspenseful plots into real historical periods, often mixing fictional intrigue with political conspiracies, espionage, or dangerous secrets. They offer fast-paced narratives anchored in richly detailed settings.',1,_binary ''),(5,4,'Classic Romance','Classic Romance tells timeless love stories set against elegant or historical backdrops. These tales explore emotion, societal expectations, and the enduring power of connection, often with refined language and memorable characters.',1,_binary ''),(6,1,'Historical Fiction','Stories set in a specific historical period.',1,_binary ''),(7,1,'Literary Fiction','Character-driven narratives with deep themes and style.',1,_binary ''),(8,1,'Science Fiction (Soft Sci-Fi)','Imaginative stories focusing more on ideas and people than hard.',1,_binary ''),(9,2,'Detective Fiction','Featuring a professional investigator solving crimes.',1,_binary ''),(10,2,'Cozy Mystery','Light, small-town crimes with amateur sleuths (often minimal violence).',1,_binary ''),(11,2,'Police Procedural','Focuses on realistic police work and investigation methods.',1,_binary ''),(12,3,'Epic/High Fantasy','Grand, world-spanning adventures with magic and mythical creatures.',1,_binary ''),(13,3,'Urban Fantasy','Magic or supernatural elements in modern, urban settings.',1,_binary ''),(14,3,'Dark Fantasy','Blends fantasy with horror or morally gray themes.',1,_binary ''),(15,4,'Contemporary Romance','Love stories set in modern times.',1,_binary ''),(16,4,'Historical Romance','Set in past eras (like Regency or Victorian periods).',1,_binary ''),(17,4,'Paranormal Romance','Romantic plots involving supernatural beings (vampires, werewolves, etc.).',1,_binary ''),(18,5,'Psychological Thriller','Tension built through the mind and emotions of characters.',1,_binary ''),(19,5,'Action Thriller','Fast-paced, high-stakes plots with physical danger.',1,_binary ''),(20,5,'Crime Thriller','Centered on criminal acts and the chase to stop or uncover them.',1,_binary '');
/*!40000 ALTER TABLE `sub_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sup_category`
--

DROP TABLE IF EXISTS `sup_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sup_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sup_category`
--

LOCK TABLES `sup_category` WRITE;
/*!40000 ALTER TABLE `sup_category` DISABLE KEYS */;
INSERT INTO `sup_category` VALUES (1,'Fiction',_binary ''),(2,'Mystery',_binary ''),(3,'Fantasy',_binary ''),(4,'Romance',_binary ''),(5,'Thriller',_binary '');
/*!40000 ALTER TABLE `sup_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('0d026e17-a295-4ed3-ba8b-eafa385a5e49','username2','$2a$10$VlhlUcFbcLwbNoW6DHAW1OtZav2C7dc5TjWAzFBn5Otuc5JizXLTO','username2@gmail.com','customer2',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',1),('30e8bca8-23a0-4c5e-bb60-d03b5e22c0f3','nhantce181298','$2a$10$Z9KhB1esZ.LAURnLdjqipuIITsXevaqimcbs27DP3ZnPngP0/sNOO','nhantce181298@fpt.edu.vn','Nha','','','/src/assets/img/avatar/sample-user-avatar.png',1),('319ac3b6-69bf-43b8-8acf-7ac19c93eafe','deptrai1000','$2a$10$Vw1eCrixjsFhXZ/iQ/v00.wxParE2KE5Vah0WLZgOlOY.uEjDJeye','deptrai1000@gmail.com',NULL,NULL,NULL,NULL,0),('337710c7-ff88-4d63-a3e5-64c1e40df725','admin','$2a$10$9sh9aq1DvE28Y1wno1bxp.ftwsp2URRtRcKVqoYQia7zRTi6nxHPi','admin@gmail.com','admin name','0123456789','admin address','/src/assets/img/avatar/admin-avatar.png',1),('424544a6-5fbf-4ec7-bb0e-ea3047982384','username1','$2a$10$9TpR3jt7WpLC69YXfbNn4.YaQvuv6hWJB8JMHt1tpgEhxL4hD9D5S','username1@gmail.com','customer1',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',1),('46532aef-6159-4800-ba74-308518741c4f','usernametaolao','$2a$10$V0UYLiJ2OUYrvsQm8Z7WLOxJGcNjjCrDhrt.E5khC7Q8GvZdT3HHi','mackereldaz@gmail.com',NULL,NULL,NULL,NULL,1),('4c72ece6-bba7-41b5-b2bf-9c01340763de','datnhce180797','$2a$10$ASt2.QlfOcm6NKi66PqupOIC9UNwEfyRKTPZ6WnJ6zqX1eMqX8OMy','datnhce180797@fpt.edu.vn','Nguyen Hoang Dat','0704716414','Hau Giang','/src/assets/img/avatar/datnhce180797.png',1),('79e6981d-369d-4ad1-bcdd-01ab085aa0da','thinhhtce191706','$2a$10$C2lXQuIg8M19AqWrrEowRusyC5Tfi4fLmslzjn3rITGna1CQKc7mC','hotienthinh.ce191706@gmail.com','Thinh',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',1),('7ecb6318-044e-4b69-8133-4b26b1d8a980','username4','$2a$10$ZrQKDi09NgfHHHqZeULyRuH4SIL4PBoL1IAh2wkTOoE7fRMiDGVYK','username4@gmail.com','4',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',1),('c3417234-e73d-412c-83f2-cdc2d75969db','nhungpttce190544','$2a$10$K3sFC6wKIlv5Lf5R/VfzquXH81/i.siWPKtyEVDpO5REbPL/4.1tu','nhungptt.ce190544@gmail.com','Nhung',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',1),('e10e0048-4498-4f86-a478-0004a3ee31aa','deptrai100','$2a$10$PfNgtX9kA8mdg4eqvg.rDuJiV.Z9kKBp9VfH8Mp5.Fd/DPW0V9upi','deptrai100@gmail.com',NULL,NULL,NULL,NULL,0),('f4a3d59d-1c18-4beb-9396-c55173bf2fc2','username3','$2a$10$3siUlCG6ftXKjld3HW8mgOJpyaccB6cwmVhy/JpoeuTX.eT416GR6','username3@gmail.com','customer3',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',0),('ff00dd10-6cd5-4482-a10b-505afeba427a','tuyenntnce190631','$2a$10$gLso5BVkRv7WRFtaz1eyfeLEWFGM2e0WreUwtqhTEFwLtD7TJpA1G','tuyenntn.ce190631@gmail.com','Tuyen',NULL,NULL,'/src/assets/img/avatar/sample-user-avatar.png',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `user_id` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES ('0d026e17-a295-4ed3-ba8b-eafa385a5e49','CUSTOMER'),('30e8bca8-23a0-4c5e-bb60-d03b5e22c0f3','STAFF'),('319ac3b6-69bf-43b8-8acf-7ac19c93eafe','CUSTOMER'),('337710c7-ff88-4d63-a3e5-64c1e40df725','ADMIN'),('424544a6-5fbf-4ec7-bb0e-ea3047982384','CUSTOMER'),('46532aef-6159-4800-ba74-308518741c4f','CUSTOMER'),('4c72ece6-bba7-41b5-b2bf-9c01340763de','STAFF'),('79e6981d-369d-4ad1-bcdd-01ab085aa0da','STAFF'),('7ecb6318-044e-4b69-8133-4b26b1d8a980','CUSTOMER'),('c3417234-e73d-412c-83f2-cdc2d75969db','STAFF'),('e10e0048-4498-4f86-a478-0004a3ee31aa','CUSTOMER'),('f4a3d59d-1c18-4beb-9396-c55173bf2fc2','CUSTOMER'),('ff00dd10-6cd5-4482-a10b-505afeba427a','STAFF');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'book_store'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-07 22:18:50
