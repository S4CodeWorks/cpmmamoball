'use client';
import { useId, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CpmAction, CpmIcon } from '@/components/ui/CpmUi';
import type { NewsItem } from '@/lib/types';
import { pathForPage } from '@/lib/routes';

type Navigate = (page:string,param?:string|number|null)=>void;
const categories = { noticia:'Notícia', inscricoes:'Inscrições', comunicado:'Comunicado', resultado:'Resultado' };

function readingTime(news:NewsItem) {
 const text=(news.body||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>|&[^;\s]+;/g,' ').trim();
 return text ? Math.max(1,Math.ceil(text.split(/\s+/).length/200))+' min' : news.readTime?.trim();
}

function NewsCard({news,onNav}:{news:NewsItem;onNav:Navigate}) {
 const titleId=useId(),reducedMotion=useReducedMotion();
 const [failedImage,setFailedImage]=useState<string|null>(null);
 const image=news.img?.trim(),hasCover=Boolean(image&&image!==failedImage);
 const time=readingTime(news),category=news.tag?.trim()||categories[news.category];
 const open=(event:MouseEvent<HTMLAnchorElement>)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();onNav('article',news.id);
 };
 return <motion.a href={pathForPage('article',news.id)!} onClick={open} aria-labelledby={titleId} className={'cpm-news-item'+(hasCover?' has-cover':'')} whileTap={reducedMotion?undefined:{scale:0.995}}>
  {hasCover&&<div className="cpm-news-cover">
   {/* eslint-disable-next-line @next/next/no-img-element -- original article asset, matching the native Figma image layer. */}
   <img src={image} alt="" width={72} height={72} loading="lazy" decoding="async" onError={()=>setFailedImage(image!)} />
  </div>}
  <div className="cpm-news-body">
   <h3 id={titleId}>{news.title}</h3>
   <div className="cpm-news-meta">
    {news.date?.trim()&&<span className="cpm-news-meta-group"><CpmIcon name="calendar"/>{news.date}</span>}
    {category&&<span className="cpm-news-meta-group">{category}</span>}
    {time&&<span className="cpm-news-meta-group"><CpmIcon name="clock"/>{time}</span>}
   </div>
   {news.excerpt?.trim()&&<p>{news.excerpt}</p>}
   <span className="cpm-news-read" aria-hidden="true"><span>Ler notícia</span><span className="cpm-news-arrow"><CpmIcon name="arrow"/></span></span>
  </div>
 </motion.a>;
}

/** DataContext already filters published articles and orders newest first. */
export function HomeNews({news,onNav}:{news:NewsItem[];onNav:Navigate}) {
 const articles=news.slice(0,3);
 if(!articles.length)return null;
 return <section className="cpm-home-news" aria-label="Notícias">
  <div className="cpm-section-heading cpm-news-heading"><h2>Notícias</h2><CpmAction onClick={()=>onNav('news')}>Ver todas</CpmAction></div>
  <div className={'cpm-news-grid'+(articles.length===1?' is-single':'')}>{articles.map(article=><NewsCard key={article.id} news={article} onNav={onNav}/>)}</div>
 </section>;
}
