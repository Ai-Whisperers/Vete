import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    
    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'vet')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'catalog'; // 'template' or 'catalog'

    // 2. Prepare Data
    let data: any[] = [];

    if (type === 'template') {
        data = [{
            'Operation (Required)': 'New Product | Purchase | Sale | Adjustment | Damage | Theft',
            'SKU': 'prod_xxxx',
            'Name': '',
            'Category': 'Alimentos | Juguetes | etc',
            'Description': '',
            'Base Price (Sell)': 0,
            'Quantity (Add/Remove)': 0,
            'Unit Cost (Buy)': 0
        }];
    } else {
        // Fetch current catalog
        const { data: products, error } = await supabase
            .from('store_products')
            .select(`
                sku, 
                name, 
                description, 
                base_price,
                store_categories(name),
                store_inventory(stock_quantity, weighted_average_cost)
            `)
            .eq('tenant_id', profile.tenant_id);

        if (error) return new NextResponse(error.message, { status: 500 });

        data = products.map((p: any) => ({
            'Operation (Optional)': 'Purchase | Price Update | Stock Removal',
            'SKU': p.sku,
            'Name': p.name,
            'Category': p.store_categories?.name || '',
            'Description': p.description || '',
            'Base Price (Sell)': p.base_price,
            'Quantity (Add/Remove)': 0,
            'Unit Cost (Buy)': p.store_inventory?.weighted_average_cost || 0,
            'Current Stock (Read Only)': p.store_inventory?.stock_quantity || 0
        }));
    }

    // 3. Create Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    // Write to buffer
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
        headers: {
            'Content-Disposition': `attachment; filename="inventory_${profile.tenant_id}_${type}.xlsx"`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    });
}
