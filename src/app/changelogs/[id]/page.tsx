import { fetchChangelogList } from '@/utils/api';
import ChangelogDetailsClient from '@/components/Changelogs/ChangelogDetailsClient';
import { notFound } from 'next/navigation';

export const revalidate = 120; // Revalidate every 2 minutes

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChangelogDetailsPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const changelogListPromise = fetchChangelogList();
    
    // Wait for the changelog list to resolve
    const changelogList = await changelogListPromise;
    
    // Sort changelogs by newest first (highest ID first)
    const sortedChangelogList = [...changelogList].sort((a, b) => b.id - a.id);
    
    // Find the current changelog in the list, handling leading zeros
    const currentChangelog = sortedChangelogList.find(changelog => changelog.id.toString() === id || changelog.id === parseInt(id));
    
    if (!currentChangelog) {
      notFound();
    }

    return (
      <ChangelogDetailsClient 
        changelogList={sortedChangelogList}
        currentChangelog={currentChangelog}
        changelogId={id}
      />
    );
  } catch (error) {
    console.error('Error fetching changelog:', error);
    notFound();
  }
} 