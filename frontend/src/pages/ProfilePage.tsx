import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { userService } from '../services/userService'

export default function ProfilePage() {
    const { user, logout, refreshToken, setUser } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    })
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name: string; email: string }) =>
            userService.updateProfile(data),
        onSuccess: (data) => {
            setUser(data.user)
            setIsEditing(false)
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
        },
    })

    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => userService.uploadAvatar(file),
        onSuccess: (data) => {
            setUser(data.user)
            setAvatarFile(null)
            setAvatarPreview(null)
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
        },
    })

    const changePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            userService.changePassword(data),
        onSuccess: () => {
            setIsChangingPassword(false)
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            alert('Password changed successfully!')
        },
    })

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await authService.logout(refreshToken)
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            logout()
            navigate('/login')
        }
    }

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault()
        updateProfileMutation.mutate(editForm)
    }

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Passwords do not match!')
            return
        }
        changePasswordMutation.mutate({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
        })
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarUpload = () => {
        if (avatarFile) {
            uploadAvatarMutation.mutate(avatarFile)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-gray-500">Please log in to view your profile.</div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Avatar Section */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {avatarPreview || user.avatarUrl ? (
                                <img
                                    src={avatarPreview || user.avatarUrl!}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                id="avatar-upload"
                            />
                            <div className="flex gap-2">
                                <label
                                    htmlFor="avatar-upload"
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                                >
                                    Choose Image
                                </label>
                                {avatarFile && (
                                    <button
                                        onClick={handleAvatarUpload}
                                        disabled={uploadAvatarMutation.isPending}
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                                    >
                                        {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload'}
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Profile Info Section */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditForm({ name: user.name, email: user.email })
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                            </div>
                        </dl>
                    )}
                </div>

                {/* Password Section */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Password</h2>
                        {!isChangingPassword && (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {isChangingPassword ? (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsChangingPassword(false)
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-sm text-gray-600">
                            ••••••••
                        </p>
                    )}
                </div>

                {/* Account Info */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}
