import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, patientAPI, authAPI } from '../services/api';
import { User, Phone, MapPin, Edit3, Save, X, Mail, Activity, Calendar, FileText } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  
  // Shared Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Doctor Form State
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [qualification, setQualification] = useState('');
  const [availableDays, setAvailableDays] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Patient Form State
  const [bloodGroup, setBloodGroup] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user?.role === 'ADMIN') {
        setAdminEmail(user.email);
        setLoading(false);
        return;
      }

      let data = null;
      if (user?.role === 'DOCTOR') {
        data = await doctorAPI.getProfile();
        if (data) {
          setSpecialization(data.specialization || '');
          setExperience(data.experience || '');
          setConsultationFee(data.consultationFee || '');
          setQualification(data.qualification || '');
          setAvailableDays(data.availableDays || '');
          setIsAvailable(data.isAvailable !== false);
        }
      } else if (user?.role === 'PATIENT') {
        data = await patientAPI.getProfile();
        if (data) {
          setBloodGroup(data.bloodGroup || '');
          setDob(data.dob || '');
          setGender(data.gender || '');
          setEmergencyContact(data.emergencyContact || '');
        }
      }
      
      if (data) {
        setProfileData(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile", error);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (user?.role === 'ADMIN') {
        await authAPI.updateProfile({ email: adminEmail });
        alert('Admin email updated successfully! Please re-login if you want the global token to reflect changes immediately.');
      } else if (user?.role === 'DOCTOR') {
        await doctorAPI.updateProfile(profileData.id, {
          ...profileData,
          name, phone, specialization, experience, consultationFee, qualification, availableDays, isAvailable
        });
        alert('Doctor profile updated successfully!');
      } else if (user?.role === 'PATIENT') {
        await patientAPI.updateProfile(profileData.id, {
          ...profileData,
          name, phone, address, bloodGroup, dob, gender, emergencyContact
        });
        alert('Patient profile updated successfully!');
      }
      
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile", error);
      alert('Failed to update profile.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Quick validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        await authAPI.updatePhoto({ photo: base64String });
        
        // Update user context manually or just reload
        alert('Profile photo updated! Please re-login to see it globally.');
        fetchProfile();
      } catch (err) {
        console.error("Error uploading photo", err);
        alert('Failed to upload photo');
      } finally {
        setPhotoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-6">
      <div className="glass-card overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-secondary/80"></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-surface flex items-center justify-center text-content text-4xl font-bold border-4 border-background shadow-lg overflow-hidden relative">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.role === 'ADMIN' ? user.username?.charAt(0).toUpperCase() : (profileData?.name?.charAt(0) || '?')
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  {photoUploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <span className="text-white text-xs font-semibold">Change</span>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePhotoUpload}
                    disabled={photoUploading}
                  />
                </div>
              </div>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-outline flex items-center gap-2">
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-5 mt-4">
              
              {user?.role === 'ADMIN' && (
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              )}

              {user?.role !== 'ADMIN' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  {user?.role === 'PATIENT' && (
                    <>
                      <div>
                        <label className="form-label">Gender</label>
                        <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                          <option value="">-- Select --</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Date of Birth</label>
                        <input type="date" className="form-control" value={dob} onChange={e => setDob(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label">Blood Group</label>
                        <input type="text" className="form-control" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label">Emergency Contact</label>
                        <input type="text" className="form-control" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Address</label>
                        <textarea className="form-control" rows="2" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                    </>
                  )}

                  {user?.role === 'DOCTOR' && (
                    <>
                      <div>
                        <label className="form-label">Specialization</label>
                        <input type="text" className="form-control" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
                      </div>
                      <div>
                        <label className="form-label">Experience</label>
                        <input type="text" className="form-control" value={experience} onChange={e => setExperience(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label">Consultation Fee ($)</label>
                        <input type="number" className="form-control" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} />
                      </div>
                      <div>
                        <label className="form-label">Qualification</label>
                        <input type="text" className="form-control" value={qualification} onChange={e => setQualification(e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Available Days</label>
                        <input type="text" className="form-control" value={availableDays} onChange={e => setAvailableDays(e.target.value)} placeholder="e.g. Mon, Wed, Fri" />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-3 mt-2">
                        <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="w-5 h-5" />
                        <label htmlFor="isAvailable" className="form-label mb-0">Currently Available for Bookings</label>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline w-32 flex justify-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary w-32 flex justify-center gap-2">
                  <Save size={16} /> Save
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-content">
                {user?.role === 'ADMIN' ? user.username : profileData?.name}
              </h2>
              <div className="inline-block px-3 py-1 mt-2 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                {user?.role}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-border">
                
                {user?.role === 'ADMIN' && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Email</p>
                      <p className="text-content font-medium">{adminEmail}</p>
                    </div>
                  </div>
                )}

                {user?.role !== 'ADMIN' && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Phone Number</p>
                      <p className="text-content font-medium">{profileData?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                )}
                
                {user?.role === 'PATIENT' && (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Address</p>
                        <p className="text-content font-medium">{profileData?.address || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Gender</p>
                        <p className="text-content font-medium">{profileData?.gender || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Blood Group</p>
                        <p className="text-content font-medium">{profileData?.bloodGroup || 'Not provided'}</p>
                      </div>
                    </div>
                  </>
                )}

                {user?.role === 'DOCTOR' && (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Specialization</p>
                        <p className="text-content font-medium">{profileData?.specialization || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Experience</p>
                        <p className="text-content font-medium">{profileData?.experience || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Qualification</p>
                        <p className="text-content font-medium">{profileData?.qualification || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mb-1">Available Days</p>
                        <p className="text-content font-medium">{profileData?.availableDays || 'Not provided'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
