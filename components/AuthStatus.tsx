"use client";

import { signIn, signOut } from "next-auth/react";

export default function AuthStatus({ session }: { session: any }) {
  if (session) {
    return (
      <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        {session.user.image && (
          <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full" />
        )}
        <div className="flex-1">
          <p className="font-semibold">{session.user.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kalan Yükleme Hakkı: <span className="font-bold text-blue-600">{session.user.uploadCredits}</span>
          </p>
        </div>
        <button 
          onClick={() => signOut()} 
          className="text-sm text-red-500 hover:underline"
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6 border border-yellow-200 dark:border-yellow-800">
      <p className="mb-2 font-semibold">Şarkı yüklemek için giriş yapmalısın.</p>
      <button 
        onClick={() => signIn("google")} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Google ile Giriş Yap
      </button>
    </div>
  );
}
