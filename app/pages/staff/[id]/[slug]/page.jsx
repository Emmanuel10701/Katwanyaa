// app/staff/[id]/page.jsx
import StaffProfilePage from '../../../../components/staffseo.jsx';

// This is your data source - adjust based on where your data lives
const STAFF_DATA = []; // Or import from a local JSON file

export async function generateMetadata({ params }) {
  const { id } = params;
  
  // Option 1: Use local data (recommended for static generation)
  const staff = STAFF_DATA.find(s => s.id === id);
  

  
  if (!staff) {
    return {
      title: "Staff Member | Katwanyaa High School",
      description: "Meet our dedicated staff member at Katwanyaa High School"
    };
  }

  const title = `${staff.name} | ${staff.position} | Katwanyaa High School`;
  const description = staff.bio || `Meet ${staff.name}, a dedicated ${staff.position} at Katwanyaa High School specializing in ${staff.department}.`;
  
  // Fix the image URL - make sure it's absolute
  const imageUrl = staff.image 
    ? staff.image.startsWith('http') 
      ? staff.image 
      : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${staff.image}`
    : `${process.env.NEXT_PUBLIC_SITE_URL || ''}/katz.jpeg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Professional portrait of ${staff.name}`
        }
      ],
      type: 'profile',
      profile: {
        firstName: staff.name.split(' ')[0],
        lastName: staff.name.split(' ').slice(1).join(' '),
        username: staff.email,
      }
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/staff/${id}`,
    }
  };
}

export async function generateStaticParams() {
  // Generate static paths at build time
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/staff`);
  const data = await res.json();
  
  return data.staff.map((staff) => ({
    id: staff.id.toString(),
  }));
}

export default function Page({ params }) {
  return <StaffProfilePage id={params.id} />;
}