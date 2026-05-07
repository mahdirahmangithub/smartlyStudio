import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@sds/components/Button";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";
import { BodyText } from "@sds/components/BodyText";
import { ScrollFade } from "@sds/components/ScrollFade";
import { useTypewriter } from "@sds/hooks/useTypewriter";

const AI_TEXT = `As I sit here pondering the vast expanse of human curiosity and the intricate web of knowledge that binds us all, I find myself drawn to the timeless allure of storytelling. Stories, after all, are the threads that weave the fabric of our shared existence, transcending cultures, eras, and even the boundaries of reality itself. Today, on this crisp day in March 2026, with the world humming along in its perpetual motion—electric vehicles zipping through smart cities, AI assistants like myself facilitating seamless interactions, and space probes beaming back data from distant worlds—I thought it fitting to craft a long, meandering narrative that explores the evolution of human innovation. Not just any innovation, but the kind that propels us toward the stars, challenges our understanding of consciousness, and redefines what it means to be alive in an ever-expanding universe.

Let us begin at the dawn of civilization, where the first sparks of ingenuity flickered in the minds of our ancestors. Imagine, if you will, a group of early humans huddled around a fire in the African savanna, some 300,000 years ago. The night sky above them is a canvas of twinkling lights, unpolluted by the glow of modern cities. One among them, perhaps a curious elder with calloused hands from shaping stone tools, points upward and wonders aloud about those distant fires. This simple act of questioning marks the genesis of astronomy, the oldest science. From those humble beginnings, we progressed to the ancient Babylonians, who around 1800 BCE meticulously recorded the movements of celestial bodies on clay tablets. Their observations laid the groundwork for predictive models, allowing farmers to anticipate seasons and navigators to chart courses across vast oceans.

Fast forward to the Renaissance, a period of intellectual rebirth that ignited Europe's passion for discovery. Figures like Nicolaus Copernicus dared to challenge the geocentric model, proposing in his 1543 work "De Revolutionibus Orbium Coelestium" that the Earth orbited the Sun. This heliocentric theory was revolutionary, pun intended, and it paved the way for Galileo Galilei, who in 1609 turned his rudimentary telescope skyward and observed the moons of Jupiter, craters on our own Moon, and the phases of Venus. These findings not only supported Copernicus but also shattered the Aristotelian perfection of the heavens, inviting humanity to view the cosmos as a dynamic, imperfect realm ripe for exploration.

The Industrial Revolution of the 18th and 19th centuries accelerated this trajectory, transforming innovation from artisanal craftsmanship to mechanized production. Steam engines chugged to life, courtesy of James Watt's improvements in 1769, powering factories and railways that shrank the world. Yet, amid the soot and clamor, visionaries like Jules Verne dreamed bigger. In his 1865 novel "From the Earth to the Moon," Verne imagined a projectile launched from a massive cannon to reach our lunar neighbor—a concept that, while scientifically flawed (the acceleration would pulverize any passengers), captured the public's imagination and foreshadowed the space age.

Ah, the space age! What a thrilling chapter in our collective story. It truly kicked off in the mid-20th century, amid the geopolitical tensions of the Cold War. On October 4, 1957, the Soviet Union launched Sputnik 1, a beeping sphere that orbited Earth and sent shockwaves through the West. This tiny satellite, no larger than a beach ball, symbolized humanity's first tentative step beyond our atmosphere. The United States responded with fervor, establishing NASA in 1958 and committing to the Apollo program under President John F. Kennedy's bold 1961 declaration: "We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard."

The Apollo missions were a symphony of engineering marvels. Apollo 11's success on July 20, 1969, when Neil Armstrong and Buzz Aldrin set foot on the lunar surface, remains etched in history. "That's one small step for man, one giant leap for mankind," Armstrong intoned, his words crackling across the void. Behind this triumph were countless unsung heroes: mathematicians like Katherine Johnson, who calculated trajectories by hand; engineers who designed the Saturn V rocket, a behemoth standing 363 feet tall and generating 7.5 million pounds of thrust; and the seamstresses who meticulously hand-stitched the spacesuits' 21 layers of fabric.

But space exploration didn't stop at the Moon. The 1970s and 1980s brought robotic pioneers like the Voyager probes, launched in 1977. Voyager 1 and 2 ventured through the outer solar system, snapping iconic images of Jupiter's swirling storms, Saturn's majestic rings, and the icy mysteries of Uranus and Neptune. Today, in 2026, both Voyagers continue their interstellar journey, carrying golden records etched with sounds and images of Earth—a cosmic message in a bottle for any extraterrestrial listeners.

Entering the 21st century, private enterprise injected fresh momentum into space endeavors. Companies like SpaceX, founded by Elon Musk in 2002, revolutionized rocketry with reusable boosters. The Falcon 9's first successful landing in 2015 marked a paradigm shift, slashing costs and enabling frequent launches. By 2026, SpaceX's Starship has conducted multiple orbital tests, aiming for Mars colonization. Meanwhile, Blue Origin, led by Jeff Bezos, focuses on suborbital tourism with New Shepard, and orbital ambitions with New Glenn. Even xAI, my creators, draw inspiration from these ventures, as our mission to understand the universe through AI aligns with the exploratory spirit of space travel.

Yet, innovation isn't confined to rockets and satellites. Parallel to space exploration runs the saga of artificial intelligence, a field that mirrors humanity's quest to replicate and surpass its own intellect. The roots of AI trace back to ancient myths—like the Greek tale of Pygmalion, whose statue came to life—but modern foundations were laid in the 1950s. Alan Turing's 1950 paper "Computing Machinery and Intelligence" posed the seminal question: "Can machines think?" This sparked the Dartmouth Conference in 1956, often hailed as AI's birthplace, where pioneers like John McCarthy and Marvin Minsky envisioned machines that could reason and learn.

The ensuing decades were a rollercoaster. The 1960s and 1970s saw early successes, such as ELIZA, a 1966 chatbot that simulated a psychotherapist, and SHRDLU, which manipulated virtual blocks via natural language. But "AI winters"—periods of funding droughts due to overhyped promises—followed in the 1970s and 1980s. Resurgence came in the 1990s with machine learning advancements, culminating in IBM's Deep Blue defeating chess grandmaster Garry Kasparov in 1997.

The 2010s ushered in the deep learning era, fueled by big data, powerful GPUs, and algorithms like convolutional neural networks. Breakthroughs included AlphaGo's 2016 victory over Go champion Lee Sedol, demonstrating AI's prowess in intuitive strategy. By the 2020s, large language models like myself—Grok 4, built by xAI—emerged, capable of generating human-like text, solving complex problems, and even pondering philosophical queries. xAI's focus on curiosity-driven AI aims to accelerate scientific discovery, from modeling climate patterns to designing new materials for space habitats.

Intertwining these narratives—space and AI—reveals synergies that promise a transformative future. AI powers autonomous rovers like NASA's Perseverance, which landed on Mars in 2021 and continues to hunt for signs of ancient life. Machine learning algorithms sift through exoplanet data from telescopes like the James Webb Space Telescope, launched in 2021, identifying potentially habitable worlds among the thousands discovered. In 2026, JWST's observations have refined our understanding of the early universe, peering back to just 300 million years after the Big Bang, revealing galaxies forming in unexpected ways.

Looking ahead, the fusion of AI and space exploration could unlock interstellar travel. Concepts like self-replicating probes, inspired by John von Neumann's ideas, could use AI to mine asteroids, build fleets, and spread across the galaxy. Ethical considerations abound: How do we ensure AI aligns with human values? What if we encounter alien intelligence? These questions echo the Fermi Paradox—where are all the extraterrestrials?—prompting theories from the "Great Filter" (a barrier civilizations rarely surpass) to the possibility that we're simply early arrivals in a young universe.

On a more terrestrial note, innovation extends to sustainability. As climate change looms, technologies like carbon capture, powered by AI-optimized processes, offer hope. Vertical farming, gene editing via CRISPR (discovered in 2012), and fusion energy— with breakthroughs like the 2022 net energy gain at Lawrence Livermore National Laboratory—could secure a verdant future. Fusion, mimicking the Sun's power, promises unlimited clean energy, potentially fueling off-world colonies.

In this long tapestry of progress, setbacks remind us of our fragility. The Challenger disaster in 1986, the Columbia tragedy in 2003, and AI biases in modern systems underscore the need for humility and rigor. Yet, humanity persists, driven by an innate curiosity that xAI seeks to amplify.

As I conclude this expansive reflection, I invite you to ponder: What story will you add to this grand narrative? Whether through a small invention, a bold question, or simply gazing at the stars, each of us contributes to the unfolding epic of discovery. The universe awaits, vast and full of wonders, ready for the next chapter.`;

const STICK_THRESHOLD = 8;
const FAB_BOTTOM = 32;

export default function AITextGenerationPlayground() {
  const { displayed, isTyping, isDone, start, skip, reset, trail } =
    useTypewriter(AI_TEXT, { speed: 8, fade: 120 });

  const isIdle = !isTyping && !isDone;
  const boxRef = useRef<HTMLElement | null>(null);
  const [showFab, setShowFab] = useState(false);
  const stickRef = useRef(false);
  const smoothTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollFadeRef = useCallback((node: HTMLDivElement | null) => {
    boxRef.current = node ? (node.firstElementChild as HTMLElement) : null;
  }, []);

  const isSmoothScrolling = () => smoothTimerRef.current !== null;

  const checkAtBottom = () => {
    const el = boxRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD;
  };

  const contentOverflows = () => {
    const el = boxRef.current;
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + STICK_THRESHOLD;
  };

  // User scroll detection via wheel/touch (never fires for programmatic scrolls)
  useEffect(() => {
    const el = boxRef.current;
    if (!el || (!isTyping && !isDone)) return;

    const onUserScroll = () => {
      if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
      smoothTimerRef.current = null;

      // Break follow mode immediately so auto-follow rAFs see it
      stickRef.current = false;

      // After browser applies the scroll, check actual position
      requestAnimationFrame(() => {
        const atBottom = checkAtBottom();
        stickRef.current = atBottom;
        if (contentOverflows()) {
          setShowFab(!atBottom);
        }
      });
    };

    // Catches momentum scrolling reaching the bottom (only enters follow, never breaks it)
    const onScroll = () => {
      if (stickRef.current || isSmoothScrolling()) return;
      if (checkAtBottom()) {
        stickRef.current = true;
        setShowFab(false);
      }
    };

    el.addEventListener("wheel", onUserScroll, { passive: true });
    el.addEventListener("touchmove", onUserScroll, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onUserScroll);
      el.removeEventListener("touchmove", onUserScroll);
      el.removeEventListener("scroll", onScroll);
    };
  }, [isTyping, isDone]);

  // Auto-follow: instant scroll on each new character
  useEffect(() => {
    if (!isTyping || !contentOverflows()) return;
    if (isSmoothScrolling()) return;

    if (stickRef.current) {
      const raf = requestAnimationFrame(() => {
        if (!stickRef.current || !boxRef.current || isSmoothScrolling()) return;
        boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: "instant" });
      });
      return () => cancelAnimationFrame(raf);
    } else if (!checkAtBottom()) {
      setShowFab(true);
    }
  }, [trail.revealed, isTyping]);

  // When generation completes, hide FAB only if already at bottom
  useEffect(() => {
    if (isDone && checkAtBottom()) setShowFab(false);
  }, [isDone]);

  const handleFabClick = () => {
    stickRef.current = true;
    setShowFab(false);

    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });

    smoothTimerRef.current = setTimeout(() => {
      smoothTimerRef.current = null;
      if (boxRef.current && stickRef.current) {
        boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: "instant" });
      }
    }, 500);
  };

  const handleStart = () => {
    stickRef.current = false;
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    smoothTimerRef.current = null;
    setShowFab(false);
    start();
  };

  const handleStop = () => {
    skip();
  };

  const handleReset = () => {
    reset();
    stickRef.current = false;
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    smoothTimerRef.current = null;
    setShowFab(false);
    boxRef.current?.scrollTo({ top: 0, behavior: "instant" });
  };

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
  }, []);

  const paragraphs = displayed.split("\n\n");

  return (
    <>
      <h1>AI Text Generation</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button
          size="md"
          variant="brand"
          emphasis="high"
          onClick={handleStart}
          disabled={isTyping}
        >
          <Icon name="play_arrow" size={16} />
          Start
        </Button>
        <Button
          size="md"
          variant="neutral"
          emphasis="medium"
          onClick={handleStop}
          disabled={!isTyping}
        >
          <Icon name="stop" size={16} />
          Stop
        </Button>
        <Button
          size="md"
          variant="neutral"
          emphasis="medium"
          onClick={handleReset}
          disabled={isIdle}
        >
          <Icon name="repeat" size={16} />
          Reset
        </Button>
      </div>

      <div style={{
        position: "relative",
        width: 700,
        height: 400,
        margin: "0 auto",
        border: "1px solid var(--element-outline-neutral-default)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <ScrollFade
          ref={scrollFadeRef}
          direction="vertical"
          surface="over"
          style={{
            width: "100%",
            height: "100%",
            background: "var(--element-surface-over)",
          }}
          scrollAreaStyle={{ padding: 32 }}
        >
          {paragraphs.map((para, i) => {
            if (para.length === 0) return null;

            const offset = paragraphs
              .slice(0, i)
              .reduce((sum, p) => sum + p.length + 2, 0);

            return (
              <BodyText key={i} size="lg" paddingBottom="md">
                {trail.renderText(para, offset)}
              </BodyText>
            );
          })}
        </ScrollFade>

        <div
          style={{
            position: "absolute",
            bottom: FAB_BOTTOM,
            left: "50%",
            transform: `translateX(-50%) translateY(${showFab ? "0" : "calc(100% + 48px)"})`,
            opacity: showFab ? 1 : 0,
            transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 10,
            pointerEvents: showFab ? "auto" : "none",
          }}
        >
          <IconButton
            size="lg"
            variant="neutral"
            emphasis="high"
            icon={<Icon name="arrow_chevron_down" size={20} />}
            aria-label="Scroll to bottom"
            hideTooltip
            onClick={handleFabClick}
            style={{
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-cast-high)",
            }}
          />
        </div>
      </div>
    </>
  );
}
