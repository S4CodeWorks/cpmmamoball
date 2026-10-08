import { supabase } from './supabase';

export type NoticeDestination = 'jogos' | 'tournaments' | 'club' | 'article' | 'subscription' | 'rules' | 'saved';
export interface Announcement {
 id:string; title:string; excerpt:string; body:string; destination:NoticeDestination|null;
 destination_id:string|null; published_at:string|null; created_at:string; created_by:string|null;
}
export async function fetchAnnouncements(staff=false,signal?:AbortSignal):Promise<Announcement[]> {
 const rows:Announcement[]=[];
 for(let offset=0;;offset+=200){
  let q=supabase.from('announcements').select('*').order('published_at',{ascending:false,nullsFirst:false}).order('id').range(offset,offset+199);
  if(!staff)q=q.not('published_at','is',null).lte('published_at',new Date().toISOString());
  if(signal)q=q.abortSignal(signal);
  const {data,error}=await q;if(error)throw error;rows.push(...(data??[]) as Announcement[]);if((data?.length??0)<200)return rows;
 }
}
export async function fetchAnnouncementReads(userId:string,signal?:AbortSignal){
 const ids:string[]=[];
 for(let offset=0;;offset+=500){let q=supabase.from('announcement_reads').select('announcement_id').eq('user_id',userId).order('announcement_id').range(offset,offset+499);if(signal)q=q.abortSignal(signal);const {data,error}=await q;if(error)throw error;ids.push(...(data??[]).map(r=>r.announcement_id as string));if((data?.length??0)<500)return ids;}
}
export async function persistAnnouncementReads(userId:string,ids:string[]){
 for(let i=0;i<ids.length;i+=100){const {error}=await supabase.from('announcement_reads').upsert(ids.slice(i,i+100).map(id=>({user_id:userId,announcement_id:id})),{onConflict:'user_id,announcement_id',ignoreDuplicates:true});if(error)throw error;}
}
export async function saveAnnouncement(values:Pick<Announcement,'title'|'excerpt'|'body'|'destination'|'destination_id'|'published_at'>,id?:string){
 const {error}=await (id?supabase.from('announcements').update(values).eq('id',id):supabase.from('announcements').insert(values));if(error)throw error;
}
export async function deleteAnnouncement(id:string){const {error}=await supabase.from('announcements').delete().eq('id',id);if(error)throw error;}
