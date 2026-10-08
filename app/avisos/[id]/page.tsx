import { PhoneShell } from "@/components/PhoneShell";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PhoneShell initialPage="notice" initialParam={id}/>;}
