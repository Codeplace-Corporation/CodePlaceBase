import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, addDoc, setDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { firestore } from "../../../firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faTrophy, faGavel, faCrosshairs, faPen, faInfoCircle, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

interface DraftJob {
  id: string;
  jobTitle: string;
  jobType: string;
  status: string;
  createdAt?: any;
  savedAt?: string;
  createdBy?: string;
  userId?: string;
  userEmail?: string;
  projectType?: string; // Job category
}

const PostJobs = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<DraftJob[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<DraftJob | null>(null);

  // Fetch user's draft jobs from Firestore
  useEffect(() => {
    const fetchDrafts = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const draftedJobsRef = collection(firestore, "draftedJobs");
        const draftedJobsQuery = query(draftedJobsRef, where("createdBy", "==", currentUser.uid));
        const draftedJobsSnapshot = await getDocs(draftedJobsQuery);
        
        const fetchedDrafts: DraftJob[] = draftedJobsSnapshot.docs.map(doc => {
          const documentData = doc.data();
          const draftData = {
            ...documentData, // Spread document data first
            id: doc.id, // Then override with the actual document ID
          };
          console.log('Individual draft data:', draftData);
          console.log('Document ID:', doc.id);
          console.log('Document exists:', doc.exists());
          console.log('Raw document data:', documentData);
          return draftData;
        }) as DraftJob[];

        console.log('Fetched drafts from draftedJobs collection:', fetchedDrafts);
        console.log('Draft IDs:', fetchedDrafts.map(draft => draft.id));
        setDrafts(fetchedDrafts);

        // Fetch staged jobs for recently posted jobs section
        const stagedJobsRef = collection(firestore, "staged_jobs");
        const stagedJobsQuery = query(stagedJobsRef, where("createdBy", "==", currentUser.uid));
        const stagedJobsSnapshot = await getDocs(stagedJobsQuery);
        
        const fetchedStagedJobs: DraftJob[] = stagedJobsSnapshot.docs.map(doc => {
          const documentData = doc.data();
          const stagedData = {
            ...documentData,
            id: doc.id,
            jobTitle: documentData.projectTitle || 'Untitled Job',
            jobType: documentData.selectedJobPostType || 'Unknown',
            status: documentData.status || 'staged'
          };
          console.log('Individual staged job data:', stagedData);
          return stagedData;
        }) as DraftJob[];

        // Filter for recently posted jobs (not drafts, but include staged)
        const recent = fetchedStagedJobs.filter((job: DraftJob) =>
          job.status !== 'draft'
        );
        setRecentJobs(recent);
      } catch (error) {
        console.error("Error fetching drafts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [currentUser]);

  const handleCreateNewJob = () => {
    // Navigate to job posting form
      navigate('/job-form');
  };

  const handleEditDraft = (jobId: string) => {
    // Navigate to edit draft
    console.log('handleEditDraft called with jobId:', jobId);
    const url = `/job-posting-form/${jobId}`;
    console.log('Navigating to URL:', url);
    navigate(url);
  };

  const handleEditStagedJob = (jobId: string) => {
    // Navigate to edit staged job
    console.log('handleEditStagedJob called with jobId:', jobId);
    const url = `/job-posting-form/${jobId}`;
    console.log('Navigating to URL:', url);
    navigate(url);
  };

  const handleDeleteDraft = (draft: DraftJob) => {
    setDraftToDelete(draft);
    setShowDeleteModal(true);
  };

  const handleDeleteStagedJob = (job: DraftJob) => {
    setDraftToDelete(job);
    setShowDeleteModal(true);
  };



  const confirmDeleteDraft = async () => {
    if (!currentUser?.uid || !draftToDelete) return;
    
    try {
      // Determine which collection to delete from based on job status
      const collectionName = draftToDelete.status === 'staged' ? 'staged_jobs' : 'draftedJobs';
      const jobRef = doc(firestore, collectionName, draftToDelete.id);
      await deleteDoc(jobRef);
      
      // Remove the job from the appropriate local state
      if (draftToDelete.status === 'staged') {
        setRecentJobs(prevJobs => prevJobs.filter(job => job.id !== draftToDelete.id));
      } else {
        setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftToDelete.id));
      }
      
      console.log(`${draftToDelete.status === 'staged' ? 'Staged job' : 'Draft'} deleted successfully:`, draftToDelete.id);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setDraftToDelete(null);
    }
  };

  const cancelDeleteDraft = () => {
    setShowDeleteModal(false);
    setDraftToDelete(null);
  };

  const handleClearAllDrafts = async () => {
    if (!currentUser?.uid) return;
    const draftedJobsRef = collection(firestore, "draftedJobs");
    const draftedJobsQuery = query(draftedJobsRef, where("createdBy", "==", currentUser.uid));
    const draftedJobsSnapshot = await getDocs(draftedJobsQuery);

    // Delete all drafts for the current user
    const deletePromises = draftedJobsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    setDrafts([]);
    console.log('All drafts deleted from Firestore.');
  };

  // Helper for job type icon (same as dashboard)
  const jobTypeIcon = (type: string) => {
    switch (type) {
      case 'Contract':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
          <FontAwesomeIcon icon={faTrophy} style={{ fontSize: '24px', color: '#3b82f6' }} />
        </span>;
      case 'Bounty':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
          <FontAwesomeIcon icon={faCrosshairs} style={{ fontSize: '24px', color: '#a855f7' }} />
        </span>;
      case 'Challenge':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
          <FontAwesomeIcon icon={faTrophy} style={{ fontSize: '24px', color: '#22c55e' }} />
        </span>;
      case 'Auction':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
          <FontAwesomeIcon icon={faGavel} style={{ fontSize: '24px', color: '#f97316' }} />
        </span>;
      default:
        return null;
    }
  };

  // Helper for job type color
  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Contract':
        return '#3b82f6'; // Blue
      case 'Bounty':
        return '#a855f7'; // Purple
      case 'Challenge':
        return '#22c55e'; // Green
      case 'Auction':
        return '#f97316'; // Orange
      default:
        return '#a1a1aa'; // Default gray
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#080808', 
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header Section */}
        <div style={{ 
          marginBottom: '0.5rem', 
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 0.8rem + 2vw, 2.5rem)',
            lineHeight: 'clamp(1.6rem, 0.9rem + 2vw, 2.6rem)',
            letterSpacing: '-0.03em',
            fontWeight: '500',
            marginBottom: 0,
            color: 'white',
            position: 'relative',
            margin: 0,
            flex: 1
          }}>
            Post Jobs
          </h1>
                      <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleCreateNewJob}
                style={{
                  padding: '0.55rem 1.2rem',
                  background: '#fff',
                  color: '#111',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.98rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.4,2,.6,1)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '-0.03em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#f3f3f3';
                  e.currentTarget.style.color = '#111';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#111';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
                }}
                onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} />
                Create New Job
              </button>
            </div>
        </div>

        {/* Recently Posted Jobs Section */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: '500',
            letterSpacing: '-0.03em',
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '0.5rem'
          }}>
            Staged Jobs
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#a1a1aa',
            marginBottom: '1.5rem',
            lineHeight: '1.4'
          }}>
            Staged jobs are published jobs that haven't reached their start date yet.
          </p>
          {recentJobs.length === 0 ? (
            <div style={{
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#a1a1aa',
              fontSize: '1rem'
            }}>
              <p style={{ marginBottom: '1rem' }}>No staged jobs found</p>
              <p style={{ fontSize: '0.875rem' }}>Complete a job posting to see it here</p>
              <button
                onClick={handleCreateNewJob}
                style={{
                  marginTop: '1.2rem',
                  padding: '0.55rem 1.2rem',
                  background: '#fff',
                  color: '#111',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.98rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.4,2,.6,1)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '-0.03em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#f3f3f3';
                  e.currentTarget.style.color = '#111';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#111';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
                }}
                onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} />
                Create New Job
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%' }}>
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                    padding: '0.7rem 1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    borderLeft: `4px solid ${getJobTypeColor(job.jobType)}`,
                    minHeight: '38px',
                    width: '100%',
                  }}
                >
                  {/* Job Type Icon */}
                  {jobTypeIcon(job.jobType)}
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.01rem', color: '#fff', marginBottom: '0.1rem' }}>
                      {job.jobTitle || 'Untitled Job'}
                    </div>
                    <div style={{ fontSize: '0.93rem', color: '#a1a1aa' }}>
                      {job.status} • {job.savedAt ? new Date(job.savedAt).toLocaleDateString() : 'Unknown date'} • {job.jobType} {job.projectType ? `• ${job.projectType}` : ''}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.2rem' }}>
                    <button
                      onClick={() => handleEditStagedJob(job.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                      title="Edit staged job"
                    >
                      <FontAwesomeIcon icon={faPen} style={{ fontSize: '18px' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteStagedJob(job)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                      title="Delete staged job"
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: '18px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Drafts Section */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: '500',
            letterSpacing: '-0.03em',
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '1.5rem'
          }}>
            Your Drafts
          </h2>
          
          {loading ? (
            <div style={{
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#fff',
              fontSize: '1rem'
            }}>
              Loading drafts...
            </div>
          ) : drafts.length === 0 ? (
            <div style={{
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#a1a1aa',
              fontSize: '1rem'
            }}>
              <p style={{ marginBottom: '1rem' }}>No drafts found</p>
              <p style={{ fontSize: '0.875rem' }}>Create your first job posting to get started</p>
              <button
                onClick={handleCreateNewJob}
                style={{
                  marginTop: '1.2rem',
                  padding: '0.55rem 1.2rem',
                  background: '#fff',
                  color: '#111',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.98rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.4,2,.6,1)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '-0.03em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#f3f3f3';
                  e.currentTarget.style.color = '#111';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#111';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
                }}
                onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} />
                Create New Job
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%' }}>
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                    padding: '0.7rem 1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    borderLeft: `4px solid ${getJobTypeColor(draft.jobType)}`,
                    minHeight: '38px',
                    width: '100%',
                  }}
                >
                  {/* Job Type Icon */}
                  {jobTypeIcon(draft.jobType)}
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.01rem', color: '#fff', marginBottom: '0.1rem' }}>
                      {draft.jobTitle || 'Untitled Job'}
                    </div>
                    <div style={{ fontSize: '0.93rem', color: '#a1a1aa' }}>
                      {draft.status} • {draft.savedAt ? new Date(draft.savedAt).toLocaleDateString() : 'Unknown date'} • {draft.jobType} {draft.projectType ? `• ${draft.projectType}` : ''}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.2rem' }}>
                    <button
                      onClick={() => handleEditDraft(draft.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                      title="Edit draft"
                    >
                      <FontAwesomeIcon icon={faPen} style={{ fontSize: '18px' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                      title="Delete draft"
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: '18px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && draftToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid #333',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '1rem',
              marginTop: 0
            }}>
              Delete {draftToDelete.status === 'staged' ? 'Staged Job' : 'Draft'}
            </h3>
                          <p style={{
                fontSize: '1rem',
                color: '#a1a1aa',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete "{draftToDelete.jobTitle || 'Untitled Job'}"? This action cannot be undone.
                {draftToDelete.status === 'staged' && ' This will permanently remove the staged job.'}
              </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDeleteDraft}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#a1a1aa';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDraft}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Delete Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJobs;