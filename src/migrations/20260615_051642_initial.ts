import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_brands_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tags_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tags_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_variant_types_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__variant_types_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_product_variants_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__product_variants_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__reviews_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_nav_items_placements" AS ENUM('header', 'bottom', 'footer', 'toolbar');
  CREATE TYPE "public"."enum_nav_items_item_type" AS ENUM('link', 'megaMenu', 'button');
  CREATE TYPE "public"."enum_nav_items_style_variant" AS ENUM('default', 'primary', 'whatsapp', 'iconOnly');
  CREATE TYPE "public"."enum_nav_items_icon" AS ENUM('none', 'home', 'grid', 'star', 'heart', 'user', 'message', 'search', 'menu', 'phone');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"image_id" integer,
  	"icon_id" integer,
  	"description" varchar,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_icon_id" integer,
  	"version_description" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"image_id" integer,
  	"description" varchar,
  	"verified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_brands_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_description" varchar,
  	"version_verified" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__brands_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tags_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tags_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "variant_types_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "variant_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"name" varchar,
  	"shared_across_variants" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_variant_types_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_variant_types_v_version_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_variant_types_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_label" varchar,
  	"version_name" varchar,
  	"version_shared_across_variants" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__variant_types_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"brand_id" integer,
  	"description" varchar,
  	"category_id" integer,
  	"featured" boolean DEFAULT false,
  	"limited_edition" boolean DEFAULT false,
  	"enable_variants" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"variant_types_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_brand_id" integer,
  	"version_description" varchar,
  	"version_category_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_limited_edition" boolean DEFAULT false,
  	"version_enable_variants" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"variant_types_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "product_variants_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type_id" integer,
  	"value" varchar
  );
  
  CREATE TABLE "product_variants_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "product_variants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_product_variants_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_product_variants_v_version_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type_id" integer,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_variants_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_variants_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_product_id" integer,
  	"version_title" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__product_variants_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "reviews_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"reviewer_name" varchar,
  	"rating" numeric DEFAULT 5,
  	"comment" varchar,
  	"verified_purchase" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_reviews_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_reviews_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_reviews_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_product_id" integer,
  	"version_reviewer_name" varchar,
  	"version_rating" numeric DEFAULT 5,
  	"version_comment" varchar,
  	"version_verified_purchase" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__reviews_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "nav_items_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_nav_items_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "nav_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "nav_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"item_type" "enum_nav_items_item_type" DEFAULT 'link',
  	"style_variant" "enum_nav_items_style_variant" DEFAULT 'default',
  	"show_on_desktop" boolean DEFAULT true,
  	"show_on_tablet" boolean DEFAULT true,
  	"show_on_mobile" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"icon" "enum_nav_items_icon" DEFAULT 'none',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"brands_id" integer,
  	"tags_id" integer,
  	"variant_types_id" integer,
  	"products_id" integer,
  	"product_variants_id" integer,
  	"reviews_id" integer,
  	"nav_items_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_icon_id_media_id_fk" FOREIGN KEY ("version_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "variant_types_options" ADD CONSTRAINT "variant_types_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_variant_types_v_version_options" ADD CONSTRAINT "_variant_types_v_version_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_variant_types_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_variant_types_v" ADD CONSTRAINT "_variant_types_v_parent_id_variant_types_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specifications" ADD CONSTRAINT "products_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_variant_types_fk" FOREIGN KEY ("variant_types_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specifications" ADD CONSTRAINT "_products_v_version_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_variant_types_fk" FOREIGN KEY ("variant_types_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants_options" ADD CONSTRAINT "product_variants_options_type_id_variant_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_variants_options" ADD CONSTRAINT "product_variants_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants_gallery" ADD CONSTRAINT "product_variants_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_variants_gallery" ADD CONSTRAINT "product_variants_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_variants_v_version_options" ADD CONSTRAINT "_product_variants_v_version_options_type_id_variant_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_variants_v_version_options" ADD CONSTRAINT "_product_variants_v_version_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_variants_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_variants_v_version_gallery" ADD CONSTRAINT "_product_variants_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_variants_v_version_gallery" ADD CONSTRAINT "_product_variants_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_variants_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_variants_v" ADD CONSTRAINT "_product_variants_v_parent_id_product_variants_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_variants_v" ADD CONSTRAINT "_product_variants_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_images" ADD CONSTRAINT "reviews_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_images" ADD CONSTRAINT "reviews_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v_version_images" ADD CONSTRAINT "_reviews_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v_version_images" ADD CONSTRAINT "_reviews_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_reviews_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_parent_id_reviews_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "nav_items_placements" ADD CONSTRAINT "nav_items_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "nav_items_children" ADD CONSTRAINT "nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variant_types_fk" FOREIGN KEY ("variant_types_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_variants_fk" FOREIGN KEY ("product_variants_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nav_items_fk" FOREIGN KEY ("nav_items_id") REFERENCES "public"."nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_icon_idx" ON "categories" USING btree ("icon_id");
  CREATE INDEX "categories_featured_idx" ON "categories" USING btree ("featured");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_image_idx" ON "_categories_v" USING btree ("version_image_id");
  CREATE INDEX "_categories_v_version_version_icon_idx" ON "_categories_v" USING btree ("version_icon_id");
  CREATE INDEX "_categories_v_version_version_featured_idx" ON "_categories_v" USING btree ("version_featured");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE INDEX "_categories_v_autosave_idx" ON "_categories_v" USING btree ("autosave");
  CREATE INDEX "brands_title_idx" ON "brands" USING btree ("title");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_image_idx" ON "brands" USING btree ("image_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "brands__status_idx" ON "brands" USING btree ("_status");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_title_idx" ON "_brands_v" USING btree ("version_title");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_image_idx" ON "_brands_v" USING btree ("version_image_id");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version__status_idx" ON "_brands_v" USING btree ("version__status");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_latest_idx" ON "_brands_v" USING btree ("latest");
  CREATE INDEX "_brands_v_autosave_idx" ON "_brands_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "tags__status_idx" ON "tags" USING btree ("_status");
  CREATE INDEX "_tags_v_parent_idx" ON "_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_version_slug_idx" ON "_tags_v" USING btree ("version_slug");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_version_version__status_idx" ON "_tags_v" USING btree ("version__status");
  CREATE INDEX "_tags_v_created_at_idx" ON "_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "_tags_v" USING btree ("updated_at");
  CREATE INDEX "_tags_v_latest_idx" ON "_tags_v" USING btree ("latest");
  CREATE INDEX "_tags_v_autosave_idx" ON "_tags_v" USING btree ("autosave");
  CREATE INDEX "variant_types_options_order_idx" ON "variant_types_options" USING btree ("_order");
  CREATE INDEX "variant_types_options_parent_id_idx" ON "variant_types_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "variant_types_name_idx" ON "variant_types" USING btree ("name");
  CREATE INDEX "variant_types_updated_at_idx" ON "variant_types" USING btree ("updated_at");
  CREATE INDEX "variant_types_created_at_idx" ON "variant_types" USING btree ("created_at");
  CREATE INDEX "variant_types__status_idx" ON "variant_types" USING btree ("_status");
  CREATE INDEX "_variant_types_v_version_options_order_idx" ON "_variant_types_v_version_options" USING btree ("_order");
  CREATE INDEX "_variant_types_v_version_options_parent_id_idx" ON "_variant_types_v_version_options" USING btree ("_parent_id");
  CREATE INDEX "_variant_types_v_parent_idx" ON "_variant_types_v" USING btree ("parent_id");
  CREATE INDEX "_variant_types_v_version_version_name_idx" ON "_variant_types_v" USING btree ("version_name");
  CREATE INDEX "_variant_types_v_version_version_updated_at_idx" ON "_variant_types_v" USING btree ("version_updated_at");
  CREATE INDEX "_variant_types_v_version_version_created_at_idx" ON "_variant_types_v" USING btree ("version_created_at");
  CREATE INDEX "_variant_types_v_version_version__status_idx" ON "_variant_types_v" USING btree ("version__status");
  CREATE INDEX "_variant_types_v_created_at_idx" ON "_variant_types_v" USING btree ("created_at");
  CREATE INDEX "_variant_types_v_updated_at_idx" ON "_variant_types_v" USING btree ("updated_at");
  CREATE INDEX "_variant_types_v_latest_idx" ON "_variant_types_v" USING btree ("latest");
  CREATE INDEX "_variant_types_v_autosave_idx" ON "_variant_types_v" USING btree ("autosave");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_specifications_order_idx" ON "products_specifications" USING btree ("_order");
  CREATE INDEX "products_specifications_parent_id_idx" ON "products_specifications" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_featured_idx" ON "products" USING btree ("featured");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_variant_types_id_idx" ON "products_rels" USING btree ("variant_types_id");
  CREATE INDEX "products_rels_tags_id_idx" ON "products_rels" USING btree ("tags_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_version_specifications_order_idx" ON "_products_v_version_specifications" USING btree ("_order");
  CREATE INDEX "_products_v_version_specifications_parent_id_idx" ON "_products_v_version_specifications" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_featured_idx" ON "_products_v" USING btree ("version_featured");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_variant_types_id_idx" ON "_products_v_rels" USING btree ("variant_types_id");
  CREATE INDEX "_products_v_rels_tags_id_idx" ON "_products_v_rels" USING btree ("tags_id");
  CREATE INDEX "product_variants_options_order_idx" ON "product_variants_options" USING btree ("_order");
  CREATE INDEX "product_variants_options_parent_id_idx" ON "product_variants_options" USING btree ("_parent_id");
  CREATE INDEX "product_variants_options_type_idx" ON "product_variants_options" USING btree ("type_id");
  CREATE INDEX "product_variants_gallery_order_idx" ON "product_variants_gallery" USING btree ("_order");
  CREATE INDEX "product_variants_gallery_parent_id_idx" ON "product_variants_gallery" USING btree ("_parent_id");
  CREATE INDEX "product_variants_gallery_image_idx" ON "product_variants_gallery" USING btree ("image_id");
  CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");
  CREATE INDEX "product_variants_updated_at_idx" ON "product_variants" USING btree ("updated_at");
  CREATE INDEX "product_variants_created_at_idx" ON "product_variants" USING btree ("created_at");
  CREATE INDEX "product_variants__status_idx" ON "product_variants" USING btree ("_status");
  CREATE INDEX "_product_variants_v_version_options_order_idx" ON "_product_variants_v_version_options" USING btree ("_order");
  CREATE INDEX "_product_variants_v_version_options_parent_id_idx" ON "_product_variants_v_version_options" USING btree ("_parent_id");
  CREATE INDEX "_product_variants_v_version_options_type_idx" ON "_product_variants_v_version_options" USING btree ("type_id");
  CREATE INDEX "_product_variants_v_version_gallery_order_idx" ON "_product_variants_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_product_variants_v_version_gallery_parent_id_idx" ON "_product_variants_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_product_variants_v_version_gallery_image_idx" ON "_product_variants_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_product_variants_v_parent_idx" ON "_product_variants_v" USING btree ("parent_id");
  CREATE INDEX "_product_variants_v_version_version_product_idx" ON "_product_variants_v" USING btree ("version_product_id");
  CREATE INDEX "_product_variants_v_version_version_updated_at_idx" ON "_product_variants_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_variants_v_version_version_created_at_idx" ON "_product_variants_v" USING btree ("version_created_at");
  CREATE INDEX "_product_variants_v_version_version__status_idx" ON "_product_variants_v" USING btree ("version__status");
  CREATE INDEX "_product_variants_v_created_at_idx" ON "_product_variants_v" USING btree ("created_at");
  CREATE INDEX "_product_variants_v_updated_at_idx" ON "_product_variants_v" USING btree ("updated_at");
  CREATE INDEX "_product_variants_v_latest_idx" ON "_product_variants_v" USING btree ("latest");
  CREATE INDEX "_product_variants_v_autosave_idx" ON "_product_variants_v" USING btree ("autosave");
  CREATE INDEX "reviews_images_order_idx" ON "reviews_images" USING btree ("_order");
  CREATE INDEX "reviews_images_parent_id_idx" ON "reviews_images" USING btree ("_parent_id");
  CREATE INDEX "reviews_images_image_idx" ON "reviews_images" USING btree ("image_id");
  CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews__status_idx" ON "reviews" USING btree ("_status");
  CREATE INDEX "_reviews_v_version_images_order_idx" ON "_reviews_v_version_images" USING btree ("_order");
  CREATE INDEX "_reviews_v_version_images_parent_id_idx" ON "_reviews_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_reviews_v_version_images_image_idx" ON "_reviews_v_version_images" USING btree ("image_id");
  CREATE INDEX "_reviews_v_parent_idx" ON "_reviews_v" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_version_version_product_idx" ON "_reviews_v" USING btree ("version_product_id");
  CREATE INDEX "_reviews_v_version_version_updated_at_idx" ON "_reviews_v" USING btree ("version_updated_at");
  CREATE INDEX "_reviews_v_version_version_created_at_idx" ON "_reviews_v" USING btree ("version_created_at");
  CREATE INDEX "_reviews_v_version_version__status_idx" ON "_reviews_v" USING btree ("version__status");
  CREATE INDEX "_reviews_v_created_at_idx" ON "_reviews_v" USING btree ("created_at");
  CREATE INDEX "_reviews_v_updated_at_idx" ON "_reviews_v" USING btree ("updated_at");
  CREATE INDEX "_reviews_v_latest_idx" ON "_reviews_v" USING btree ("latest");
  CREATE INDEX "_reviews_v_autosave_idx" ON "_reviews_v" USING btree ("autosave");
  CREATE INDEX "nav_items_placements_order_idx" ON "nav_items_placements" USING btree ("order");
  CREATE INDEX "nav_items_placements_parent_idx" ON "nav_items_placements" USING btree ("parent_id");
  CREATE INDEX "nav_items_children_order_idx" ON "nav_items_children" USING btree ("_order");
  CREATE INDEX "nav_items_children_parent_id_idx" ON "nav_items_children" USING btree ("_parent_id");
  CREATE INDEX "nav_items_updated_at_idx" ON "nav_items" USING btree ("updated_at");
  CREATE INDEX "nav_items_created_at_idx" ON "nav_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_variant_types_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_types_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_product_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("product_variants_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_nav_items_id_idx" ON "payload_locked_documents_rels" USING btree ("nav_items_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "_tags_v" CASCADE;
  DROP TABLE "variant_types_options" CASCADE;
  DROP TABLE "variant_types" CASCADE;
  DROP TABLE "_variant_types_v_version_options" CASCADE;
  DROP TABLE "_variant_types_v" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_specifications" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_version_specifications" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "product_variants_options" CASCADE;
  DROP TABLE "product_variants_gallery" CASCADE;
  DROP TABLE "product_variants" CASCADE;
  DROP TABLE "_product_variants_v_version_options" CASCADE;
  DROP TABLE "_product_variants_v_version_gallery" CASCADE;
  DROP TABLE "_product_variants_v" CASCADE;
  DROP TABLE "reviews_images" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "_reviews_v_version_images" CASCADE;
  DROP TABLE "_reviews_v" CASCADE;
  DROP TABLE "nav_items_placements" CASCADE;
  DROP TABLE "nav_items_children" CASCADE;
  DROP TABLE "nav_items" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum_brands_status";
  DROP TYPE "public"."enum__brands_v_version_status";
  DROP TYPE "public"."enum_tags_status";
  DROP TYPE "public"."enum__tags_v_version_status";
  DROP TYPE "public"."enum_variant_types_status";
  DROP TYPE "public"."enum__variant_types_v_version_status";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_product_variants_status";
  DROP TYPE "public"."enum__product_variants_v_version_status";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum__reviews_v_version_status";
  DROP TYPE "public"."enum_nav_items_placements";
  DROP TYPE "public"."enum_nav_items_item_type";
  DROP TYPE "public"."enum_nav_items_style_variant";
  DROP TYPE "public"."enum_nav_items_icon";`)
}
