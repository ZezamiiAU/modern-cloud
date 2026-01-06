CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TABLE "core"."audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_ref_id" uuid,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."building_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_ref_id" uuid NOT NULL,
	"external_building_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_building_slug" CHECK ("core"."building_refs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "core"."device_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_ref_id" uuid NOT NULL,
	"site_ref_id" uuid,
	"external_device_id" text NOT NULL,
	"slug" text NOT NULL,
	"device_type" text,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_device_slug" CHECK ("core"."device_refs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "core"."memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_ref_id" uuid NOT NULL,
	"role" text NOT NULL,
	"invited_by" uuid,
	"invited_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chk_role" CHECK ("core"."memberships"."role" IN ('owner', 'global_admin', 'global_user', 'viewer'))
);
--> statement-breakpoint
CREATE TABLE "core"."org_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_org_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_refs_external_org_id_unique" UNIQUE("external_org_id"),
	CONSTRAINT "org_refs_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_org_slug" CHECK ("core"."org_refs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "core"."org_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_ref_id" uuid NOT NULL,
	"audit_retention_days" integer DEFAULT 365,
	"timezone" text DEFAULT 'UTC',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_settings_org_ref_id_unique" UNIQUE("org_ref_id")
);
--> statement-breakpoint
CREATE TABLE "core"."pass_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pass_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"device_ref_id" uuid,
	"location" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_event_type" CHECK ("core"."pass_events"."event_type" IN ('scanned', 'entry', 'exit', 'denied'))
);
--> statement-breakpoint
CREATE TABLE "core"."passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_ref_id" uuid NOT NULL,
	"site_ref_id" uuid,
	"user_id" uuid,
	"code" text NOT NULL,
	"pass_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"visitor_name" text,
	"visitor_email" text,
	"host_user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chk_pass_type" CHECK ("core"."passes"."pass_type" IN ('visitor', 'contractor', 'delivery', 'event')),
	CONSTRAINT "chk_pass_status" CHECK ("core"."passes"."status" IN ('pending', 'active', 'expired', 'revoked'))
);
--> statement-breakpoint
CREATE TABLE "core"."site_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" uuid NOT NULL,
	"site_ref_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chk_site_role" CHECK ("core"."site_memberships"."role" IN ('site_admin', 'site_user', 'site_viewer'))
);
--> statement-breakpoint
CREATE TABLE "core"."site_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_ref_id" uuid NOT NULL,
	"external_site_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_site_slug" CHECK ("core"."site_refs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "core"."slug_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_slug" text NOT NULL,
	"parent_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_entity_type" CHECK ("core"."slug_history"."entity_type" IN ('org', 'site', 'building', 'device'))
);
--> statement-breakpoint
CREATE TABLE "core"."user_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"email" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_primary" boolean DEFAULT false,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_email" text NOT NULL,
	"name" text,
	"picture_url" text,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "core"."audit_log" ADD CONSTRAINT "audit_log_org_ref_id_org_refs_id_fk" FOREIGN KEY ("org_ref_id") REFERENCES "core"."org_refs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."building_refs" ADD CONSTRAINT "building_refs_site_ref_id_site_refs_id_fk" FOREIGN KEY ("site_ref_id") REFERENCES "core"."site_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."device_refs" ADD CONSTRAINT "device_refs_org_ref_id_org_refs_id_fk" FOREIGN KEY ("org_ref_id") REFERENCES "core"."org_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."device_refs" ADD CONSTRAINT "device_refs_site_ref_id_site_refs_id_fk" FOREIGN KEY ("site_ref_id") REFERENCES "core"."site_refs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."memberships" ADD CONSTRAINT "memberships_org_ref_id_org_refs_id_fk" FOREIGN KEY ("org_ref_id") REFERENCES "core"."org_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."memberships" ADD CONSTRAINT "memberships_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."org_settings" ADD CONSTRAINT "org_settings_org_ref_id_org_refs_id_fk" FOREIGN KEY ("org_ref_id") REFERENCES "core"."org_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."pass_events" ADD CONSTRAINT "pass_events_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "core"."passes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."pass_events" ADD CONSTRAINT "pass_events_device_ref_id_device_refs_id_fk" FOREIGN KEY ("device_ref_id") REFERENCES "core"."device_refs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."passes" ADD CONSTRAINT "passes_org_ref_id_org_refs_id_fk" FOREIGN KEY ("org_ref_id") REFERENCES "core"."org_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."passes" ADD CONSTRAINT "passes_site_ref_id_site_refs_id_fk" FOREIGN KEY ("site_ref_id") REFERENCES "core"."site_refs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."passes" ADD CONSTRAINT "passes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."passes" ADD CONSTRAINT "passes_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."site_memberships" ADD CONSTRAINT "site_memberships_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "core"."memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."site_memberships" ADD CONSTRAINT "site_memberships_site_ref_id_site_refs_id_fk" FOREIGN KEY ("site_ref_id") REFERENCES "core"."site_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."site_refs" ADD CONSTRAINT "site_refs_org_ref_id_org_refs_id_fk" FOREIGN KEY ("org_ref_id") REFERENCES "core"."org_refs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_log_org_time" ON "core"."audit_log" USING btree ("org_ref_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_log_user" ON "core"."audit_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_log_resource" ON "core"."audit_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_building_external" ON "core"."building_refs" USING btree ("site_ref_id","external_building_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_building_slug" ON "core"."building_refs" USING btree ("site_ref_id","slug");--> statement-breakpoint
CREATE INDEX "idx_building_refs_site" ON "core"."building_refs" USING btree ("site_ref_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_device_external" ON "core"."device_refs" USING btree ("org_ref_id","external_device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_device_slug" ON "core"."device_refs" USING btree ("org_ref_id","slug");--> statement-breakpoint
CREATE INDEX "idx_device_refs_org" ON "core"."device_refs" USING btree ("org_ref_id");--> statement-breakpoint
CREATE INDEX "idx_device_refs_site" ON "core"."device_refs" USING btree ("site_ref_id");--> statement-breakpoint
CREATE INDEX "idx_device_refs_type" ON "core"."device_refs" USING btree ("org_ref_id","device_type");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_org" ON "core"."memberships" USING btree ("user_id","org_ref_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_user" ON "core"."memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_org" ON "core"."memberships" USING btree ("org_ref_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_role" ON "core"."memberships" USING btree ("org_ref_id","role");--> statement-breakpoint
CREATE INDEX "idx_org_refs_slug" ON "core"."org_refs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_org_refs_external" ON "core"."org_refs" USING btree ("external_org_id");--> statement-breakpoint
CREATE INDEX "idx_pass_events_pass" ON "core"."pass_events" USING btree ("pass_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_pass_events_device" ON "core"."pass_events" USING btree ("device_ref_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_pass_code" ON "core"."passes" USING btree ("org_ref_id","code");--> statement-breakpoint
CREATE INDEX "idx_passes_org" ON "core"."passes" USING btree ("org_ref_id");--> statement-breakpoint
CREATE INDEX "idx_passes_org_status" ON "core"."passes" USING btree ("org_ref_id","status");--> statement-breakpoint
CREATE INDEX "idx_passes_org_valid" ON "core"."passes" USING btree ("org_ref_id","status","valid_to");--> statement-breakpoint
CREATE INDEX "idx_passes_site" ON "core"."passes" USING btree ("site_ref_id");--> statement-breakpoint
CREATE INDEX "idx_passes_user" ON "core"."passes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_passes_code" ON "core"."passes" USING btree ("org_ref_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_membership_site" ON "core"."site_memberships" USING btree ("membership_id","site_ref_id");--> statement-breakpoint
CREATE INDEX "idx_site_memberships_membership" ON "core"."site_memberships" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_site_memberships_site" ON "core"."site_memberships" USING btree ("site_ref_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_site_external" ON "core"."site_refs" USING btree ("org_ref_id","external_site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_site_slug" ON "core"."site_refs" USING btree ("org_ref_id","slug");--> statement-breakpoint
CREATE INDEX "idx_site_refs_org" ON "core"."site_refs" USING btree ("org_ref_id");--> statement-breakpoint
CREATE INDEX "idx_site_refs_slug" ON "core"."site_refs" USING btree ("org_ref_id","slug");--> statement-breakpoint
CREATE INDEX "idx_slug_history_lookup" ON "core"."slug_history" USING btree ("entity_type","old_slug","parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_identity_provider" ON "core"."user_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "idx_user_identities_user" ON "core"."user_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_identities_provider" ON "core"."user_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "core"."users" USING btree ("primary_email");--> statement-breakpoint
CREATE INDEX "idx_users_deleted" ON "core"."users" USING btree ("deleted_at");