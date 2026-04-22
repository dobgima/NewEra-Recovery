import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Phone, Mail, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import {
  getSupportContacts,
  createSupportContact,
  updateSupportContact,
  deleteSupportContact,
  type SupportContact,
  type CreateSupportContactPayload,
  type UpdateSupportContactPayload
} from '@/lib/api';

type SupportContactsPageProps = {
  // onNavigate: (screen: Screen) => void; // Not used in this component
};

type ContactFormData = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isEmergency: boolean;
  isPrimary: boolean;
};

export function SupportContactsPage({}: SupportContactsPageProps) {
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<SupportContact | null>(null);
  const { toast, setToast } = useToast();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isEmergency: false,
    isPrimary: false,
  });

  const loadContacts = async () => {
    try {
      const token = localStorage.getItem('newera-recovery-auth')
        ? JSON.parse(localStorage.getItem('newera-recovery-auth')!).accessToken
        : '';
      const data = await getSupportContacts(token);
      setContacts(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load support contacts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isEmergency: false,
      isPrimary: false,
    });
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (contact: SupportContact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship || '',
      phone: contact.phone || '',
      email: contact.email || '',
      isEmergency: contact.isEmergency,
      isPrimary: contact.isPrimary,
    });
    setEditingContact(contact);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('newera-recovery-auth')
        ? JSON.parse(localStorage.getItem('newera-recovery-auth')!).accessToken
        : '';

      const payload: CreateSupportContactPayload | UpdateSupportContactPayload = {
        name: formData.name,
        relationship: formData.relationship || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        isEmergency: formData.isEmergency,
        isPrimary: formData.isPrimary,
      };

      if (editingContact) {
        await updateSupportContact(token, editingContact.id, payload);
        setToast({ type: 'success', message: 'Contact updated successfully!' });
      } else {
        await createSupportContact(token, payload as CreateSupportContactPayload);
        setToast({ type: 'success', message: 'Contact added successfully!' });
      }

      await loadContacts();
      closeModal();
    } catch (error) {
      setToast({ type: 'error', message: editingContact ? 'Failed to update contact.' : 'Failed to add contact.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingContact) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('newera-recovery-auth')
        ? JSON.parse(localStorage.getItem('newera-recovery-auth')!).accessToken
        : '';
      await deleteSupportContact(token, deletingContact.id);
      setToast({ type: 'success', message: 'Contact deleted successfully!' });
      await loadContacts();
      setDeletingContact(null);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete contact.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your support contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Support Contacts</h1>
          <p className="mt-2 text-slate-600">Manage your trusted support network for when you need help.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={16} />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Phone size={24} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">No support contacts yet</h3>
              <p className="text-slate-600 mt-1">Add trusted friends, family, or professionals you can reach out to during difficult times.</p>
            </div>
            <Button onClick={openAddModal} variant="secondary">
              <Plus size={16} className="mr-2" />
              Add Your First Contact
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="relative">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-950">{contact.name}</h3>
                    {contact.relationship && (
                      <p className="text-sm text-slate-600">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {contact.isPrimary && (
                      <Badge variant="solid" className="bg-sky-100 text-sky-800">
                        <Star size={12} className="mr-1" />
                        Primary
                      </Badge>
                    )}
                    {contact.isEmergency && (
                      <Badge variant="solid" className="bg-red-100 text-red-800">
                        <AlertTriangle size={12} className="mr-1" />
                        Emergency
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone size={14} />
                      <a href={`tel:${contact.phone}`} className="hover:text-sky-600">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail size={14} />
                      <a href={`mailto:${contact.email}`} className="hover:text-sky-600">
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditModal(contact)}
                    className="flex-1"
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingContact(contact)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-slate-950 mb-6">
                {editingContact ? 'Edit Contact' : 'Add Support Contact'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                  placeholder="Full name"
                />

                <Input
                  label="Relationship"
                  value={formData.relationship}
                  onChange={(e) => handleFormChange('relationship', e.target.value)}
                  placeholder="e.g., Therapist, Friend, Family"
                />

                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="contact@example.com"
                />

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => handleFormChange('isPrimary', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Set as primary contact</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isEmergency}
                      onChange={(e) => handleFormChange('isEmergency', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Emergency contact</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : editingContact ? 'Update' : 'Add Contact'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeletingContact(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h2 className="text-xl font-semibold text-slate-950 mb-4">Delete Contact</h2>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <strong>{deletingContact.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDeletingContact(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <div className={`fixed bottom-4 right-4 rounded-lg px-4 py-3 text-sm font-medium shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}
    </motion.div>
  );
}