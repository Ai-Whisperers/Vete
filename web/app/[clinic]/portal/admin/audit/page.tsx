"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { ShieldAlert, User, Clock, Monitor } from "lucide-react";

export default function AuditLogsPage() {
    const { clinic } = useParams() as { clinic: string };
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLogs = async () => {
             const { data } = await supabase
                .from('audit_logs')
                .select(`
                    *,
                    profiles:user_id ( email, full_name, role )
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (data) setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, [supabase]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading audit trail...</div>;

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Security Audit Logs</h1>
                    <p className="text-gray-500 font-medium">Track sensitive system actions.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Resource</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.length > 0 ? logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-bold font-mono">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-bold text-gray-900">{log.profiles?.email || 'System'}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 ml-6">{log.profiles?.role}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">
                                    {log.resource}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                                    No logs recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
