from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Interview, UserProfile


class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile - shows profile settings on User edit page.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"


class UserAdmin(BaseUserAdmin):
    """
    Extended User admin that includes UserProfile inline.
    """
    inlines = [UserProfileInline]


# Re-register User with our custom admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin for UserProfile - manage notification preferences.
    """
    list_display = [
        "user",
        "email_notifications_enabled",
        "reminder_days_before",
        "reminder_time",
    ]
    list_filter = ["email_notifications_enabled"]
    search_fields = ["user__username", "user__email"]


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
        "pipeline_stage",
        "status",
        "interview_type",
        "location",
        "reminder_sent",
    ]

    # Sidebar filters for quick filtering
    list_filter = ["status", "pipeline_stage", "interview_type", "location", "reminder_sent"]

    # Fields that can be searched via the search box
    search_fields = ["company_name", "position"]

    # Enables date-based drill-down navigation
    date_hierarchy = "interview_date"

    # Orders by interview date (most recent first)
    ordering = ["-interview_date"]

    # Groups fields in the edit form for better organization
    fieldsets = [
        ("Interview Details", {"fields": ["user", "company_name", "position", "interview_date"]}),
        ("Pipeline", {"fields": ["pipeline_stage", "application_date"]}),
        ("Classification", {"fields": ["interview_type", "status", "location"]}),
        ("Notifications", {"fields": ["reminder_sent"]}),
        ("Additional Info", {"fields": ["notes"], "classes": ["collapse"]}),
    ]

    # Makes the list view editable for quick status updates
    list_editable = ["status", "pipeline_stage"]
