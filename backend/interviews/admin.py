from django.contrib import admin

from .models import Interview


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Interview model.
    Customizes how interviews appear and can be managed in Django Admin.
    """

    # Columns displayed in the list view
    list_display = [
        "company_name",
        "position",
        "interview_date",
        "status",
        "interview_type",
        "location",
    ]

    # Sidebar filters for quick filtering
    list_filter = ["status", "interview_type", "location"]

    # Fields that can be searched via the search box
    search_fields = ["company_name", "position"]

    # Enables date-based drill-down navigation
    date_hierarchy = "interview_date"

    # Orders by interview date (most recent first)
    ordering = ["-interview_date"]

    # Groups fields in the edit form for better organization
    fieldsets = [
        ("Interview Details", {"fields": ["company_name", "position", "interview_date"]}),
        ("Classification", {"fields": ["interview_type", "status", "location"]}),
        ("Additional Info", {"fields": ["notes"], "classes": ["collapse"]}),
    ]

    # Makes the list view editable for quick status updates
    list_editable = ["status"]
