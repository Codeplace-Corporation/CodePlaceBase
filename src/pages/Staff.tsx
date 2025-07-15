import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserPlus,
  faLink,
  faCopy,
  faCheck,
  faTimes,
  faDownload,
  faGlobe,
  faChartLine,
  faTrash,
  faEdit,
  faEye
} from '@fortawesome/free-solid-svg-icons';


interface WaitlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  timestamp: any;
  createdAt: string;
  status: string;
}

interface Intern {
  id: string;
  name: string;
  email: string;
  role: string;
  trackingCode: string;
  websiteLink: string;
  discordLink: string;
  signups: number;
  discordJoins: number;
  createdAt: Date;
  isActive: boolean;
}

interface SignupEntry {
  id: string;
  internId: string;
  email: string;
  timestamp: any; // Firestore Timestamp or Date
  source: 'website' | 'discord';
}

const Staff: React.FC = () => {
  const { currentUser } = useAuth();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [signups, setSignups] = useState<SignupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'waitlist' | 'interns'>('waitlist');
  const [showAddIntern, setShowAddIntern] = useState(false);
  const [showSignupsList, setShowSignupsList] = useState<string | null>(null);
  const [newIntern, setNewIntern] = useState({
    name: '',
    email: '',
    role: 'Intern'
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Check if user is authorized staff
  const isAuthorizedStaff = currentUser?.email === 'diegorafaelpitt@gmail.com' || 
                           currentUser?.email === 'jacobnathanshapiro@gmail.com';

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthorizedStaff) {
      window.location.href = '/';
    }
  }, [isAuthorizedStaff]);

  // Fetch waitlist data
  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const waitlistQuery = query(
          collection(firestore, 'waitlist'),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(waitlistQuery);
        const waitlistData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as WaitlistEntry[];
        setWaitlist(waitlistData);
      } catch (error) {
        console.error('Error fetching waitlist:', error);
      }
    };

    // Fetch interns data
    const fetchInterns = async () => {
      try {
        const internsQuery = query(
          collection(firestore, 'interns'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(internsQuery);
        const internsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Intern[];
        setInterns(internsData);
      } catch (error) {
        console.error('Error fetching interns:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch signups data
    const fetchSignups = async () => {
      try {
        const signupsQuery = query(
          collection(firestore, 'signups'),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(signupsQuery);
        const signupsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SignupEntry[];
        setSignups(signupsData);
      } catch (error) {
        console.error('Error fetching signups:', error);
      }
    };

    if (isAuthorizedStaff) {
      fetchWaitlist();
      fetchInterns();
      fetchSignups();
    }
  }, [isAuthorizedStaff]);

  // Generate tracking code
  const generateTrackingCode = (name: string): string => {
    const timestamp = Date.now().toString(36);
    const nameCode = name.replace(/\s+/g, '').toLowerCase().substring(0, 3);
    return `${nameCode}${timestamp}`;
  };

  // Add new intern
  const handleAddIntern = async () => {
    if (!newIntern.name || !newIntern.email) return;

    const trackingCode = generateTrackingCode(newIntern.name);
    const websiteLink = `https://codeplace.co/CreateAccount?ref=${trackingCode}`;
    const discordLink = `https://codeplace.co/discord?ref=${trackingCode}`;

    const internData = {
      ...newIntern,
      trackingCode,
      websiteLink,
      discordLink,
      signups: 0,
      discordJoins: 0,
      createdAt: new Date(),
      isActive: true
    };

    try {
      const docRef = await addDoc(collection(firestore, 'interns'), internData);
      const newInternWithId = { ...internData, id: docRef.id };
      setInterns(prev => [newInternWithId, ...prev]);
      setNewIntern({ name: '', email: '', role: 'Intern' });
      setShowAddIntern(false);
    } catch (error) {
      console.error('Error adding intern:', error);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Get signups for a specific intern
  const getInternSignups = (internId: string) => {
    const intern = interns.find(i => i.id === internId);
    if (!intern) return [];
    return signups.filter(signup => signup.internId === intern.trackingCode);
  };

  // Delete intern function
  const deleteIntern = async (internId: string) => {
    if (!window.confirm('Are you sure you want to delete this intern? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete the intern document
      await deleteDoc(doc(firestore, 'interns', internId));
      
      // Remove from local state
      setInterns(prev => prev.filter(intern => intern.id !== internId));
      
      console.log('Intern deleted successfully');
    } catch (error) {
      console.error('Error deleting intern:', error);
      alert('Failed to delete intern. Please try again.');
    }
  };

  // Export waitlist to CSV
  const exportWaitlistToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'User Type', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...waitlist.map(entry => [
        `${entry.firstName} ${entry.lastName}`,
        entry.email,
        entry.phone,
        entry.userType,
        entry.status,
        new Date(entry.timestamp?.toDate?.() || entry.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  if (!isAuthorizedStaff) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading staff dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Staff Dashboard</h1>
          <p className="text-white/60">Manage waitlist and intern tracking</p>
        </div>



        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'waitlist'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Waitlist ({waitlist.length})
          </button>
          <button
            onClick={() => setActiveTab('interns')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'interns'
                ? 'bg-white text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Interns ({interns.length}/5)
          </button>
        </div>

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="space-y-6">
            {/* Waitlist Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">{waitlist.length}</div>
                <div className="text-white/60 text-sm">Total Entries</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {waitlist.filter(entry => entry.userType === 'developer').length}
                </div>
                <div className="text-white/60 text-sm">Developers</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {waitlist.filter(entry => entry.userType === 'client').length}
                </div>
                <div className="text-white/60 text-sm">Clients</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {waitlist.filter(entry => entry.status === 'pending').length}
                </div>
                <div className="text-white/60 text-sm">Pending</div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={exportWaitlistToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faDownload} />
                Export to CSV
              </button>
            </div>

            {/* Waitlist Table */}
            <div className="bg-white/5 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {waitlist.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {entry.firstName} {entry.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{entry.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{entry.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.userType === 'developer' 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {entry.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.status === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                          {new Date(entry.timestamp?.toDate?.() || entry.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Interns Tab */}
        {activeTab === 'interns' && (
          <div className="space-y-6">
            {/* Add Intern Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Intern Management</h2>
              {interns.length < 5 && (
                <button
                  onClick={() => setShowAddIntern(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Add Intern
                </button>
              )}
            </div>

            {/* Interns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interns.map((intern) => (
                <div key={intern.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{intern.name}</h3>
                      <p className="text-white/60 text-sm">{intern.email}</p>
                      <p className="text-white/40 text-xs">{intern.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        intern.isActive 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {intern.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => deleteIntern(intern.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        title="Delete intern"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Tracking Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{intern.signups}</div>
                      <div className="text-xs text-white/60">Website Signups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{intern.discordJoins}</div>
                      <div className="text-xs text-white/60">Discord Joins</div>
                    </div>
                  </div>
                  
                  {/* View Signups Button */}
                  <div className="text-center mb-4">
                    <button
                      onClick={() => setShowSignupsList(intern.id)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors"
                    >
                      View All Signups ({getInternSignups(intern.id).length})
                    </button>
                  </div>

                  {/* Tracking Links */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider">Website Link</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={intern.websiteLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white/10 rounded text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(intern.websiteLink)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          <FontAwesomeIcon 
                            icon={copiedLink === intern.websiteLink ? faCheck : faCopy} 
                            className={copiedLink === intern.websiteLink ? 'text-green-400' : 'text-white/60'}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider">Discord Link</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={intern.discordLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white/10 rounded text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(intern.discordLink)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          <FontAwesomeIcon 
                            icon={copiedLink === intern.discordLink ? faCheck : faCopy} 
                            className={copiedLink === intern.discordLink ? 'text-green-400' : 'text-white/60'}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Code */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <label className="text-xs text-white/60 uppercase tracking-wider">Tracking Code</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={intern.trackingCode}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/10 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(intern.trackingCode)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <FontAwesomeIcon icon={faCopy} className="text-white/60" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {interns.length === 0 && (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUserPlus} className="text-4xl text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-white/60 mb-2">No interns added yet</h3>
                <p className="text-white/40">Add your first intern to start tracking their referrals</p>
              </div>
            )}
          </div>
        )}

        {/* Add Intern Modal */}
        {showAddIntern && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold mb-4">Add New Intern</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newIntern.name}
                    onChange={(e) => setNewIntern(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40"
                    placeholder="Enter intern name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newIntern.email}
                    onChange={(e) => setNewIntern(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40"
                    placeholder="Enter intern email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={newIntern.role}
                    onChange={(e) => setNewIntern(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40"
                    placeholder="Enter role (e.g., Intern, Junior Developer)"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddIntern(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIntern}
                  disabled={!newIntern.name || !newIntern.email}
                  className="flex-1 px-4 py-2 bg-white text-black rounded hover:bg-white/90 transition-colors disabled:bg-white/20 disabled:text-white/40"
                >
                  Add Intern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signups List Modal */}
        {showSignupsList && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 w-full max-w-4xl max-h-[80vh] border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Signups for {interns.find(i => i.id === showSignupsList)?.name}
                </h3>
                <button
                  onClick={() => setShowSignupsList(null)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {getInternSignups(showSignupsList).length > 0 ? (
                  <div className="space-y-2">
                    {getInternSignups(showSignupsList).map((signup) => (
                      <div key={signup.id} className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <div>
                          <div className="font-medium">{signup.email}</div>
                          <div className="text-sm text-white/60">
                            {(() => {
                              try {
                                const date = signup.timestamp?.toDate?.() || signup.timestamp;
                                return new Date(date).toLocaleString();
                              } catch (error) {
                                return 'Invalid date';
                              }
                            })()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          signup.source === 'website' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {signup.source === 'website' ? 'Website' : 'Discord'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    No signups recorded yet for this intern.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff; 