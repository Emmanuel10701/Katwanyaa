import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    
    // List all files in the bucket
    const { data: files, error } = await supabase.storage
      .from('Katwanyaa High')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    // Get file URLs and metadata
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from('Katwanyaa High')
          .getPublicUrl(`${folder}/${file.name}`);

        return {
          ...file,
          url: publicUrl,
          fullPath: `${folder}/${file.name}`,
          folder: folder
        };
      })
    );

    return Response.json({ 
      success: true, 
      files: filesWithUrls,
      count: filesWithUrls.length
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return Response.json(
        { error: 'File path is required', success: false },
        { status: 400 }
      );
    }

    const { error } = await supabase.storage
      .from('Katwanyaa High')
      .remove([path]);

    if (error) throw error;

    return Response.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}