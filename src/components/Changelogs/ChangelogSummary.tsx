import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../UI/IconWrapper';
import { cleanMarkdown } from '@/utils/changelogs';
import { motion } from 'framer-motion';

interface ChangelogSummaryProps {
  changelogId: number;
  title: string;
  content: string;
}

interface TagData {
  name: string;
  category: string;
  relevance: number;
  type: string;
}

export default function ChangelogSummary({ changelogId, title, content }: ChangelogSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [whatsNew, setWhatsNew] = useState<string>('');
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSummary = useCallback(async () => {
    if (loading) return; // Prevent duplicate calls while loading

    setLoading(true);
    setError('');

    try {
      // Clean the content before sending to API
      const cleanedContent = cleanMarkdown(content);

      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleanedContent, title, changelogId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
      setHighlights(data.highlights || []);
      setWhatsNew(data.whatsNew || '');
      setTags(data.tags || []);
      setHasGenerated(true);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }, [content, title, changelogId, loading]);

  const checkCachedSummary = useCallback(async () => {
    try {
      const cleanedContent = cleanMarkdown(content);
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleanedContent, title, changelogId }),
      });

      const data = await response.json();

      if (response.ok && data.cached) {
        // Cached summary found, load it automatically
        setSummary(data.summary);
        setHighlights(data.highlights || []);
        setWhatsNew(data.whatsNew || '');
        setTags(data.tags || []);
        setHasGenerated(true);
      }
    } catch (error) {
      // Silently fail for cached check - user can still manually generate
      console.debug('No cached summary found or error checking cache:', error);
    }
  }, [content, title, changelogId]);

  useEffect(() => {
    // Reset state when changelogId changes (navigation to different changelog)
    setSummary('');
    setHighlights([]);
    setWhatsNew('');
    setTags([]);
    setError('');
    setHasGenerated(false);

    // Auto-check for cached summary
    if (content.length > 300) {
      checkCachedSummary();
    }
  }, [changelogId, content.length, checkCachedSummary]);

  // Show message for short content
  if (content.length <= 300) {
    return (
      <div className="bg-secondary-bg border-border-focus hover:border-border-focus hover:shadow-card-shadow mb-6 rounded-lg border p-4 transition-colors duration-200 hover:shadow-lg">
        <div className="flex items-center gap-2">
          <Icon icon="solar:magic-stick-3-bold" className="text-link h-5 w-5" />
          <span className="text-primary-text font-medium">AI Summary</span>
        </div>
        <p className="text-primary-text mt-2 text-sm">
          AI summaries are not available for short changelogs. This changelog is too brief to
          generate a meaningful summary.
        </p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-secondary-bg border-border-focus hover:border-border-focus hover:shadow-card-shadow mb-6 rounded-lg border p-4 transition-colors duration-200 hover:shadow-lg">
        <div className="mb-2 flex items-center gap-2">
          <Icon icon="solar:magic-stick-3-bold" className="text-link h-5 w-5 animate-pulse" />
          <span className="text-primary-text font-medium">Generating AI Summary</span>
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-secondary-text text-sm"
        >
          Thinking...
        </motion.div>
      </div>
    );
  }

  // Show error state with retry button
  if (error) {
    return (
      <div className="bg-secondary-bg border-border-focus hover:border-border-focus hover:shadow-card-shadow mb-6 rounded-lg border p-4 transition-colors duration-200 hover:shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" className="h-5 w-5 text-red-500" />
            <span className="text-primary-text font-medium">AI Summary Error</span>
          </div>
          <button
            onClick={generateSummary}
            className="bg-button-info text-form-button-text hover:bg-button-info-hover cursor-pointer rounded px-3 py-1 text-sm transition-colors"
          >
            Retry
          </button>
        </div>
        <p className="text-primary-text text-sm">{error}</p>
      </div>
    );
  }

  // Show generated summary
  if (hasGenerated && summary) {
    return (
      <div className="bg-secondary-bg border-border-focus hover:border-border-focus hover:shadow-card-shadow mb-6 rounded-lg border p-4 transition-colors duration-200 hover:shadow-lg">
        <div className="max-h-80 overflow-y-auto">
          <div className="mb-3 flex items-center gap-2">
            <Icon icon="solar:magic-stick-3-bold" className="text-link h-5 w-5" />
            <span className="text-primary-text font-medium">AI Summary</span>
          </div>

          <p className="text-secondary-text mb-3">{summary}</p>

          {highlights.length > 0 && (
            <div className="mb-3">
              <h4 className="text-primary-text mb-2 font-medium">Key Highlights:</h4>
              <ul className="text-secondary-text space-y-1">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-link mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {whatsNew && (
            <div className="mb-3">
              <h4 className="text-primary-text mb-2 font-medium">What&apos;s New:</h4>
              <p className="text-secondary-text">{whatsNew}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-primary-text border-border hover:text-link flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors"
                  title={`${tag.category} (${Math.round(tag.relevance * 100)}% relevant)`}
                >
                  <Icon icon="solar:tag-bold" className="h-3 w-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show generate button (default state)
  return (
    <div className="bg-secondary-bg border-border-focus hover:border-border-focus hover:shadow-card-shadow mb-6 rounded-lg border p-4 transition-colors duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="solar:magic-stick-3-bold" className="text-link h-5 w-5" />
          <span className="text-primary-text font-medium">AI Summary</span>
        </div>
        <button
          onClick={generateSummary}
          className="bg-button-info text-form-button-text hover:bg-button-info-hover flex cursor-pointer items-center gap-2 rounded px-4 py-2 transition-colors"
        >
          <Icon icon="solar:magic-stick-3-bold" className="h-4 w-4" />
          Generate Summary
        </button>
      </div>
    </div>
  );
}
