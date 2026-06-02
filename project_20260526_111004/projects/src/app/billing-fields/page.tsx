'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingFieldsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/customer-billing-fields'); }, [router]);
  return null;
}
