"""
Migration to rename Interview -> JobApplication and InterviewRound -> Interview.

This is a significant schema change that:
1. Renames the Interview model to JobApplication
2. Renames the InterviewRound model to Interview
3. Updates foreign key references
4. Removes deprecated fields from JobApplication
5. Adds new fields to Interview (formerly InterviewRound)

Note: This migration should be run with the database backed up first.
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("interviews", "0006_add_interview_round"),
    ]

    operations = [
        # =========================================================================
        # Step 1: Rename Interview model to JobApplication
        # =========================================================================
        migrations.RenameModel(
            old_name="Interview",
            new_name="JobApplication",
        ),
        
        # =========================================================================
        # Step 2: Rename InterviewRound model to Interview
        # =========================================================================
        migrations.RenameModel(
            old_name="InterviewRound",
            new_name="Interview",
        ),
        
        # =========================================================================
        # Step 3: Update the FK in Interview (was InterviewRound) to point to 
        # JobApplication (was Interview) with new field name
        # =========================================================================
        migrations.RenameField(
            model_name="interview",
            old_name="interview",
            new_name="job_application",
        ),
        
        # =========================================================================
        # Step 4: Update related_name on the FK to JobApplication.user
        # =========================================================================
        migrations.AlterField(
            model_name="jobapplication",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="applications",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        
        # =========================================================================
        # Step 5: Remove deprecated fields from JobApplication
        # =========================================================================
        migrations.RemoveField(
            model_name="jobapplication",
            name="interview_date",
        ),
        migrations.RemoveField(
            model_name="jobapplication",
            name="interview_type",
        ),
        migrations.RemoveField(
            model_name="jobapplication",
            name="status",
        ),
        migrations.RemoveField(
            model_name="jobapplication",
            name="location",
        ),
        migrations.RemoveField(
            model_name="jobapplication",
            name="interview_stage",
        ),
        migrations.RemoveField(
            model_name="jobapplication",
            name="pipeline_stage",
        ),
        migrations.RemoveField(
            model_name="jobapplication",
            name="reminder_sent",
        ),
        
        # =========================================================================
        # Step 6: Add new fields to JobApplication
        # =========================================================================
        migrations.AddField(
            model_name="jobapplication",
            name="job_url",
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="salary_min",
            field=models.PositiveIntegerField(
                blank=True,
                help_text="Minimum salary expectation or offer amount",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="salary_max",
            field=models.PositiveIntegerField(
                blank=True,
                help_text="Maximum salary expectation or offer amount",
                null=True,
            ),
        ),
        
        # =========================================================================
        # Step 7: Rename 'stage' to 'interview_type' in Interview model
        # =========================================================================
        migrations.RenameField(
            model_name="interview",
            old_name="stage",
            new_name="interview_type",
        ),
        
        # =========================================================================
        # Step 8: Update interview_type choices and add new fields to Interview
        # =========================================================================
        migrations.AlterField(
            model_name="interview",
            name="interview_type",
            field=models.CharField(
                choices=[
                    ("phone_screening", "Phone Screening"),
                    ("recruiter_call", "Recruiter Call"),
                    ("technical", "Technical Interview"),
                    ("coding", "Coding Challenge"),
                    ("system_design", "System Design"),
                    ("behavioral", "Behavioral Interview"),
                    ("hiring_manager", "Hiring Manager"),
                    ("team_fit", "Team Fit / Culture"),
                    ("onsite", "Onsite Interview"),
                    ("final", "Final Round"),
                    ("hr_final", "HR Final"),
                    ("offer_call", "Offer Call"),
                ],
                max_length=20,
            ),
        ),
        
        # Add location field to Interview
        migrations.AddField(
            model_name="interview",
            name="location",
            field=models.CharField(
                choices=[
                    ("remote", "Remote"),
                    ("onsite", "On-site"),
                    ("hybrid", "Hybrid"),
                ],
                default="remote",
                max_length=20,
            ),
        ),
        
        # Add interviewer fields
        migrations.AddField(
            model_name="interview",
            name="interviewer_name",
            field=models.CharField(
                blank=True,
                help_text="Name(s) of the interviewer(s)",
                max_length=200,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="interviewer_title",
            field=models.CharField(
                blank=True,
                help_text="Title/role of the interviewer",
                max_length=200,
                null=True,
            ),
        ),
        
        # Rename notes to feedback in Interview
        migrations.RenameField(
            model_name="interview",
            old_name="notes",
            new_name="feedback",
        ),
        
        # Add reminder_sent to Interview
        migrations.AddField(
            model_name="interview",
            name="reminder_sent",
            field=models.BooleanField(
                default=False,
                help_text="Whether an email reminder has been sent for this interview",
            ),
        ),
        
        # =========================================================================
        # Step 9: Update model Meta options
        # =========================================================================
        migrations.AlterModelOptions(
            name="jobapplication",
            options={
                "ordering": ["-created_at"],
                "verbose_name": "Job Application",
                "verbose_name_plural": "Job Applications",
            },
        ),
        migrations.AlterModelOptions(
            name="interview",
            options={
                "ordering": ["scheduled_date", "created_at"],
                "verbose_name": "Interview",
                "verbose_name_plural": "Interviews",
            },
        ),
    ]
