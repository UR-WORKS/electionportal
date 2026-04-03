'use client';

import { useState } from 'react';
import { VoterCountModal } from './VoterCountModal';

type Props = {
  boothId: number;
  initialTotalVoters: number;
};

export function VoterCountPrompt({ boothId, initialTotalVoters }: Props) {
  const [showModal, setShowModal] = useState(initialTotalVoters === 0);

  if (!showModal) return null;

  return (
    <VoterCountModal
      boothId={boothId}
      onSuccess={() => {
        setShowModal(false);
        window.location.reload();
      }}
    />
  );
}
