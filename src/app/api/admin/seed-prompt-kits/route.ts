import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const mockPromptKits = [
  {
    name: 'SEO Content Strategy Kit',
    description: 'A comprehensive set of prompts for planning, creating, and optimizing SEO content.',
    article: 'This kit contains 5 prompts that work together to help you build a complete SEO content strategy...',
    image_url: '/images/prompt-kits/seo-kit.png',
    keywords: ['SEO', 'content marketing', 'blogging', 'keyword research'],
    rating: 4.9,
    likes_count: 856,
    views_count: 12845,
    uses_count: 3267,
    visibility: 'published',
    tier: 'pro'
  },
  {
    name: 'Social Media Campaign Bundle',
    description: 'Everything you need to plan, create, and schedule a successful social media campaign.',
    article: 'This bundle includes campaign planning, content creation for 5 platforms, and analytics review prompts...',
    image_url: '/images/prompt-kits/social-media-bundle.png',
    keywords: ['social media', 'marketing', 'campaign', 'content creation'],
    rating: 4.8,
    likes_count: 743,
    views_count: 9876,
    uses_count: 2814,
    tier: 'pro',
    visibility: 'published'
  },
  {
    name: 'Academic Research Assistant Kit',
    description: 'A collection of prompts designed to help researchers at every stage of the academic process.',
    article: 'The Academic Research Assistant Kit provides specialized prompts for literature reviews, methodology planning...',
    image_url: '/images/prompt-kits/research-kit.png',
    keywords: ['academic', 'research', 'literature review', 'thesis', 'dissertation'],
    rating: 4.7,
    likes_count: 612,
    views_count: 7532,
    uses_count: 2156,
    tier: 'free',
    visibility: 'published'
  },
  {
    name: 'E-Commerce Product Launch Kit',
    description: 'Launch new products successfully with this comprehensive set of prompts covering all aspects of product marketing.',
    article: 'The E-Commerce Product Launch Kit contains 8 specialized prompts that cover every touchpoint in a successful product launch...',
    image_url: '/images/prompt-kits/ecommerce-kit.png',
    keywords: ['e-commerce', 'product launch', 'marketing', 'sales'],
    rating: 4.9,
    likes_count: 892,
    views_count: 14568,
    uses_count: 4125,
    tier: 'pro',
    visibility: 'published'
  },
  {
    name: 'UX Design Process Kit',
    description: 'A complete set of prompts covering the entire UX design process from research to usability testing.',
    article: 'The UX Design Process Kit contains specialized prompts for user research, persona development, journey mapping...',
    image_url: '/images/prompt-kits/ux-kit.png',
    keywords: ['UX design', 'user research', 'wireframing', 'usability', 'design thinking'],
    rating: 4.8,
    likes_count: 723,
    views_count: 9125,
    uses_count: 2576,
    tier: 'pro',
    visibility: 'published'
  }
];

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Check if we already have prompt kits
    const { count, error: countError } = await supabase
      .from('prompt_kits')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking prompt kits count:', countError);
      return NextResponse.json(
        { error: 'Failed to check existing prompt kits' },
        { status: 500 }
      );
    }

    // If we already have prompt kits, don't seed
    if (count && count > 0) {
      return NextResponse.json({
        message: 'Prompt kits already exist',
        kitCount: count
      });
    }

    console.log('Seeding prompt kits...');

    // Insert prompt kits
    const { data: insertedKits, error: insertError } = await supabase
      .from('prompt_kits')
      .insert(mockPromptKits)
      .select();

    if (insertError) {
      console.error('Error inserting prompt kits:', insertError);
      return NextResponse.json(
        { error: 'Failed to create prompt kits', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully created ${insertedKits.length} prompt kits`);

    return NextResponse.json({
      message: 'Prompt kits seeded successfully',
      kits: insertedKits.map(kit => ({
        id: kit.id,
        name: kit.name,
        tier: kit.tier,
        visibility: kit.visibility
      }))
    });

  } catch (error) {
    console.error('Error in prompt kits seed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
