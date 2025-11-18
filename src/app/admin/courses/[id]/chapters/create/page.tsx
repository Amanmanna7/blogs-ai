'use client';

import { use } from 'react';
import ChapterTopicForm from '@/components/ChapterTopicForm';

interface CreateChapterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CreateChapterPage({ params }: CreateChapterPageProps) {
  const resolvedParams = use(params);
  
  return (
    <ChapterTopicForm 
      courseId={resolvedParams.id}
    />
  );
}
