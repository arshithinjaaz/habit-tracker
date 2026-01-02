import { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

// Comprehensive quotes database organized by category
const quotesDatabase = {
  Love: [
    "Love is not about possession. Love is about appreciation.",
    "The best thing to hold onto in life is each other.",
    "Where there is love there is life.",
    "Love is the bridge between you and everything.",
    "Love recognizes no barriers.",
    "Love is composed of a single soul inhabiting two bodies.",
    "To love and be loved is to feel the sun from both sides.",
    "Love is when the other person's happiness is more important than your own.",
    "Love is not finding someone to live with, it's finding someone you can't live without.",
    "The greatest happiness of life is the conviction that we are loved.",
    "Love is the master key that opens the gates of happiness.",
    "Love is a friendship set to music.",
    "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    "Love is not about how much you say 'I love you', but how much you prove that it's true.",
    "Love doesn't make the world go round. Love is what makes the ride worthwhile.",
    "The art of love is largely the art of persistence.",
    "Love is the only force capable of transforming an enemy into a friend.",
    "Love is that condition in which the happiness of another person is essential to your own.",
    "Love is like the wind, you can't see it but you can feel it.",
    "The best and most beautiful things in this world cannot be seen or even heard, but must be felt with the heart.",
    "Love is not what you say. Love is what you do.",
    "True love stories never have endings.",
    "Love is patient, love is kind.",
    "Love is the greatest refreshment in life.",
    "Where love is, there God is also.",
    "Love yourself first and everything else falls into line.",
  ],
  Life: [
    "Life is what happens when you're busy making other plans.",
    "The purpose of our lives is to be happy.",
    "Life is really simple, but we insist on making it complicated.",
    "In the end, it's not the years in your life that count. It's the life in your years.",
    "Life is a journey, not a destination.",
    "Life is 10% what happens to you and 90% how you react to it.",
    "The only impossible journey is the one you never begin.",
    "Life isn't about finding yourself. Life is about creating yourself.",
    "Your time is limited, don't waste it living someone else's life.",
    "Life is made of ever so many partings welded together.",
    "The good life is one inspired by love and guided by knowledge.",
    "Life is not measured by the number of breaths we take, but by the moments that take our breath away.",
    "Life is a succession of lessons which must be lived to be understood.",
    "Life is either a daring adventure or nothing at all.",
    "The biggest adventure you can take is to live the life of your dreams.",
    "Life is short, and it is up to you to make it sweet.",
    "Life is a mirror and will reflect back to the thinker what he thinks into it.",
    "Life is about making an impact, not making an income.",
    "Life is a series of natural and spontaneous changes. Don't resist them.",
    "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate.",
    "Life is too important to be taken seriously.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "Life is a long lesson in humility.",
    "The unexamined life is not worth living.",
    "Life is 10% what happens to us and 90% how we respond to it.",
    "Life shrinks or expands in proportion to one's courage.",
    "In three words I can sum up everything I've learned about life: it goes on.",
  ],
  Patience: [
    "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.",
    "All good things come to those who wait.",
    "Patience is bitter, but its fruit is sweet.",
    "Rivers know this: there is no hurry. We shall get there someday.",
    "Patience and perseverance have a magical effect before which difficulties disappear.",
    "The key to everything is patience. You get the chicken by hatching the egg, not by smashing it.",
    "Patience is the companion of wisdom.",
    "Genius is nothing but a greater aptitude for patience.",
    "Have patience with all things, but first of all with yourself.",
    "Patience is power. Patience is not an absence of action; rather it is timing.",
    "One moment of patience may ward off great disaster. One moment of impatience may ruin a whole life.",
    "Patience attracts happiness; it brings near that which is far.",
    "Trees that are slow to grow bear the best fruit.",
    "Patience is the calm acceptance that things can happen in a different order than the one you have in mind.",
    "The two most powerful warriors are patience and time.",
    "Patience is a virtue, and I'm learning patience. It's a tough lesson.",
    "Adopt the pace of nature: her secret is patience.",
    "Patience is waiting. Not passively waiting. That is laziness. But to keep going when the going is hard.",
    "Have patience. All things are difficult before they become easy.",
    "Patience is not simply the ability to wait - it's how we behave while we're waiting.",
    "Patience and silence are the strengths of the weak and the weaknesses of the strong.",
    "With love and patience, nothing is impossible.",
    "Patience is the art of concealing your impatience.",
    "The practice of patience guards us against losing our presence of mind.",
    "Patience is the best remedy for every trouble.",
    "He that can have patience can have what he will.",
  ],
  Time: [
    "Time is what we want most, but what we use worst.",
    "The bad news is time flies. The good news is you're the pilot.",
    "Lost time is never found again.",
    "Time is more valuable than money. You can get more money, but you cannot get more time.",
    "Time you enjoy wasting is not wasted time.",
    "Time is a created thing. To say 'I don't have time' is to say 'I don't want to'.",
    "The trouble is, you think you have time.",
    "Time is the most valuable thing a man can spend.",
    "Time is the longest distance between two places.",
    "Time flies over us, but leaves its shadow behind.",
    "Time changes everything except something within us which is always surprised by change.",
    "Time is what keeps everything from happening at once.",
    "Time and tide wait for no man.",
    "They always say time changes things, but you actually have to change them yourself.",
    "Time is free, but it's priceless. You can't own it, but you can use it.",
    "Yesterday is history, tomorrow is a mystery, but today is a gift. That is why it is called the present.",
    "Time waits for no one.",
    "The future is something which everyone reaches at the rate of sixty minutes an hour.",
    "Time is a gift that most of us take for granted.",
    "Time is the wisest counselor of all.",
    "Time is the school in which we learn, time is the fire in which we burn.",
    "Better three hours too soon than a minute too late.",
    "Time spent with family is worth every second.",
    "The key is in not spending time, but in investing it.",
    "Time is an illusion.",
    "Make use of time, let not advantage slip.",
  ],
};

const QuoteOfTheDay = () => {
  // Get quote based on day of year to ensure same quote throughout the day
  const { quote, category } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Flatten all quotes into a single array with category information
    const allQuotes = Object.entries(quotesDatabase).flatMap(([cat, quotes]) =>
      quotes.map(quote => ({ quote, category: cat }))
    );
    
    // Use day of year to select quote (will be same all day)
    const selectedQuote = allQuotes[dayOfYear % allQuotes.length];
    
    return selectedQuote;
  }, []);

  const MotionPaper = motion(Paper);

  const getCategoryColor = (category) => {
    const colors = {
      Love: '#e91e63',
      Life: '#667eea',
      Patience: '#4caf50',
      Time: '#ff9800',
    };
    return colors[category] || '#667eea';
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${getCategoryColor(category)}15 0%, ${getCategoryColor(category)}05 100%)`,
        borderLeft: `4px solid ${getCategoryColor(category)}`,
      }}
    >
      {/* Decorative quote icon */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          opacity: 0.1,
          transform: 'rotate(180deg)',
        }}
      >
        <FormatQuoteIcon sx={{ fontSize: 120, color: getCategoryColor(category) }} />
      </Box>

      {/* Category chip */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={category}
          size="small"
          sx={{
            bgcolor: getCategoryColor(category),
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      {/* Quote text */}
      <Typography
        variant="h6"
        sx={{
          fontStyle: 'italic',
          color: 'text.primary',
          lineHeight: 1.6,
          position: 'relative',
          fontWeight: 500,
          '&::before': {
            content: '"""',
            position: 'absolute',
            left: -16,
            top: -8,
            fontSize: '2rem',
            color: getCategoryColor(category),
            opacity: 0.5,
          },
        }}
      >
        {quote}
      </Typography>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 2,
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        Quote of the Day • {new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </Typography>
    </MotionPaper>
  );
};

export default QuoteOfTheDay;
