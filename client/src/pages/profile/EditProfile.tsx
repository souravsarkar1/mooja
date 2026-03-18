import api from '@/api/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    avatar: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/me');
        setForm({
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          avatar: data.avatar || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          phone: data.phone || '',
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await api.put('/users/me', form);
      const updatedUser = {
        id: data._id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        name: data.name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        phone: data.phone,
      };

      updateUser(updatedUser);
      toast.success('Profile updated');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/40 to-white pb-24">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/profile')} className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-black text-gray-900">Edit Profile</h1>
          <div className="w-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-violet-100 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(109,40,217,0.25)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-24 w-24 rounded-[1.75rem] border-4 border-violet-100">
              <AvatarImage src={form.avatar} />
              <AvatarFallback className="bg-violet-50 text-2xl font-black text-violet-600">
                {(form.username || user?.username || 'U')[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="your-site.com"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell people a little about yourself"
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              maxLength={280}
              className="min-h-32"
            />
            <p className="text-right text-xs font-medium text-gray-400">{form.bio.length}/280</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || saving} className="rounded-2xl px-6">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
