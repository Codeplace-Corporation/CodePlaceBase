import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, increment } from 'firebase/firestore';
import { firestore } from '../utils/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const DISCORD_INVITE = 'https://discord.gg/Hgd8s68fZU';

const DiscordRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Redirecting you to Discord...');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref) {
      setStatus('error');
      setMessage('Missing referral code.');
      return;
    }

    const incrementDiscordJoins = async () => {
      try {
        // Find the intern by trackingCode
        const internsQuery = query(collection(firestore, 'interns'), where('trackingCode', '==', ref));
        const internsSnapshot = await getDocs(internsQuery);
        if (internsSnapshot.empty) {
          setStatus('error');
          setMessage('Invalid referral code.');
          return;
        }
        const internDoc = internsSnapshot.docs[0];
        // Increment discordJoins
        await updateDoc(doc(firestore, 'interns', internDoc.id), {
          discordJoins: increment(1)
        });
        // Log the join in signups collection
        await addDoc(collection(firestore, 'signups'), {
          internId: ref,
          email: '', // No email for Discord joins
          timestamp: new Date(),
          source: 'discord'
        });
        setStatus('success');
        setMessage('Redirecting you to Discord...');
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = DISCORD_INVITE;
        }, 1200);
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };
    incrementDiscordJoins();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 shadow-lg flex flex-col items-center max-w-md w-full border border-white/10">
        <FontAwesomeIcon icon={faDiscord} className="text-5xl text-indigo-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">{status === 'error' ? 'Error' : 'Redirecting...'}</h2>
        <p className="text-white/80 mb-4 text-center">{message}</p>
        {status === 'loading' && (
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-white/60" />
        )}
        {status === 'error' && (
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            Go Home
          </button>
        )}
      </div>
    </div>
  );
};

export default DiscordRedirect; 