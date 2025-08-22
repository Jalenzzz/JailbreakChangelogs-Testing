import { fetchChangelogList } from '@/utils/api';
import ChangelogDetailsClient from '@/components/Changelogs/ChangelogDetailsClient';
import { notFound } from 'next/navigation';

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
    
    // Find the current changelog in the list, handling leading zeros
    const currentChangelog = changelogList.find(changelog => changelog.id.toString() === id || changelog.id === parseInt(id));
    
    if (!currentChangelog) {
      notFound();
    }

    return (
      <ChangelogDetailsClient 
        changelogList={changelogList}
        currentChangelog={currentChangelog}
        changelogId={id}
      />
    );
  } catch (error) {
    console.error('Error fetching changelog:', error);
    notFound();
  }
} 