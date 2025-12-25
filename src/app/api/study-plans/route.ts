import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET - Fetch user's active study plan
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the most recent active plan
    const { data: plan, error } = await supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (which is fine)
      console.error("Error fetching study plan:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: plan || null });
  } catch (error: any) {
    console.error("Error in GET /api/study-plans:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save new study plan
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planName, startDate, endDate, planData } = body;

    if (!planData) {
      return NextResponse.json(
        { error: "Plan data is required" },
        { status: 400 }
      );
    }

    // Add completedTasks to planData if not present
    const enrichedPlanData = {
      ...planData,
      completedTasks: planData.completedTasks || {},
    };

    const { data: plan, error } = await supabase
      .from("study_plans")
      .insert({
        user_id: user.id,
        plan_name: planName || "My Study Plan",
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate || null,
        plan_data: enrichedPlanData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating study plan:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Error in POST /api/study-plans:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update existing plan (task completion, etc.)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, completedTasks, planData } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // First fetch the existing plan to merge data
    const { data: existingPlan, error: fetchError } = await supabase
      .from("study_plans")
      .select("plan_data")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching existing plan:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Merge the updates with existing plan_data
    const updatedPlanData = {
      ...existingPlan.plan_data,
      ...(planData || {}),
      completedTasks: completedTasks !== undefined
        ? completedTasks
        : existingPlan.plan_data?.completedTasks || {},
    };

    const { data: plan, error } = await supabase
      .from("study_plans")
      .update({
        plan_data: updatedPlanData,
      })
      .eq("id", planId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating study plan:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Error in PUT /api/study-plans:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a study plan
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("study_plans")
      .delete()
      .eq("id", planId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting study plan:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/study-plans:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
