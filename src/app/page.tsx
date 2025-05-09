'use client';
import Layout from '@/components/layout/layout';
import { ActionButtonList } from '@/components/ActionButtonList';
import { InfoList } from '@/components/InfoList';

export default function Home() {
  return (
    <Layout>
      <div>
        <ActionButtonList />
        <InfoList />
      </div>
    </Layout>
  );
}
