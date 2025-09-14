'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Accordion = dynamic(() => import('@mui/material/Accordion'), { ssr: false });
const AccordionSummary = dynamic(() => import('@mui/material/AccordionSummary'), { ssr: false });
const AccordionDetails = dynamic(() => import('@mui/material/AccordionDetails'), { ssr: false });
const Typography = dynamic(() => import('@mui/material/Typography'), { ssr: false });
const ExpandMoreIcon = dynamic(() => import('@mui/icons-material/ExpandMore'), { ssr: false });

const faqs = [
  {
    question: 'What is the OG Finder?',
    answer:
      'The OG Finder is a tool that helps you locate items you originally owned in Jailbreak but have since traded away. It shows you who currently possesses your former items and tracks their journey through the trading community.',
  },
  {
    question: 'How do I use the OG Finder?',
    answer:
      'Enter your Roblox ID or username in the search box above. The system will identify all items you originally owned but traded away, displaying who currently has them in their inventory.',
  },
  {
    question: "Why can't I find some of my items?",
    answer:
      "Items may not appear if the current owner has not been scanned by our bots. Our system only tracks items that have been scanned and logged in our database, so unscanned inventories won't show up in results.",
  },
  {
    question: 'How accurate is this information?',
    answer:
      "The data should be highly accurate for the most part. While this is a beta feature, we're confident in the reliability of the information displayed.",
  },
  {
    question: 'Can I view detailed trading history?',
    answer:
      'Yes! Click on any item to view its complete trading history, including all previous owners and the dates when trades occurred.',
  },
  {
    question: 'Can I manually add or report missing items?',
    answer:
      'No, our system is fully automated to maintain data accuracy and integrity. Items are only added when our bots scan inventories.',
  },
];

const OGFinderFAQ: React.FC = () => {
  return (
    <div className="mt-8 rounded-lg border border-[#2E3944] bg-[#212A31] p-6">
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
              border: '1px solid #2E3944',
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

export default OGFinderFAQ;
