'use client';

import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'What is the Dupe Finder?',
    answer:
      'The Dupe Finder is a tool that helps you identify potentially duplicated items in Jailbreak. It scans inventories to find items that may have been duplicated through exploits or glitches.',
  },
  {
    question: 'How do I use the Dupe Finder?',
    answer:
      'Enter a Roblox ID or username in the search box above. The system will search through our collected data to identify any items associated with that user that appear to be duplicated based on our detection methods.',
  },
  {
    question: 'How much data do you have?',
    answer:
      "We've logged over 8 million items and counting! Our comprehensive database continues to grow daily as we scan inventories across the Jailbreak community, providing the most extensive dupe detection available.",
  },
  {
    question: 'How does this compare to the dupe calculator (deprecated)?',
    answer:
      "Unlike the old dupe calculator, you can't manually report dupes with this new system, making it way more accurate. It's powered by the comprehensive data we have collected, including unknown dupes that don't show up on competitor websites.",
  },
  {
    question: 'How accurate is the dupe detection?',
    answer:
      "The data should be highly accurate for the most part. While this is a beta feature, we're confident in the reliability of the information displayed.",
  },
  {
    question: 'Can I report incorrect detections or missed dupes?',
    answer:
      'No, unlike the old dupe calculator, you cannot manually report incorrect detections or missed dupes with this new system. The detection is fully automated based on our collected data to maintain accuracy and integrity.',
  },
  {
    question: "Why can't I find some users or items?",
    answer:
      "Items are constantly being added each day to grow our database bigger. Our system only tracks items that have been scanned by our bots, so if a user hasn't been scanned recently, their items won't appear in results.",
  },
  {
    question: 'What happened to the old dupe calculator?',
    answer:
      'The old deprecated dupe calculator will be kept for reference but is no longer maintained. This new dupe finder provides more accurate and comprehensive results.',
  },
];

const DupeFinderFAQ: React.FC = () => {
  return (
    <div className="mt-8 rounded-lg border bg-[#212A31] p-6">
      <h3 className="text-muted mb-4 text-xl font-semibold">Frequently Asked Questions</h3>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            defaultExpanded={index === 0}
            sx={{
              backgroundColor: '#212A31',
              color: '#D3D9D4',
              '&:before': {
                display: 'none',
              },

              '& .MuiAccordionSummary-root': {
                backgroundColor: '#1A2025',
                '&:hover': {
                  backgroundColor: '#1A2025',
                },
              },
              '&:hover': {
                borderColor: '#5865F2',
              },
              transition: 'border-color 0.2s ease-in-out',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#D3D9D4' }} />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                },
              }}
            >
              <Typography className="font-semibold">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#2E3944' }}>
              <Typography className="text-muted">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default DupeFinderFAQ;
