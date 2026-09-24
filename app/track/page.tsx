import { redirect } from 'next/navigation';

export default function TrackRedirectPage() {
  redirect('/contact?tab=track');
}
