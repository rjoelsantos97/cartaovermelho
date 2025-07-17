-- Fix slug generation function to properly handle Portuguese characters
CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS VARCHAR(100) AS $$
BEGIN
    -- Advanced slug generation with proper Portuguese character handling
    RETURN SUBSTRING(
        TRIM(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(
                                    REGEXP_REPLACE(
                                        REGEXP_REPLACE(
                                            REGEXP_REPLACE(
                                                REGEXP_REPLACE(
                                                    REGEXP_REPLACE(
                                                        REGEXP_REPLACE(
                                                            LOWER(title_text),
                                                            '[àáâãäåæ]', 'a', 'g'
                                                        ),
                                                        '[èéêë]', 'e', 'g'
                                                    ),
                                                    '[ìíîï]', 'i', 'g'
                                                ),
                                                '[òóôõöø]', 'o', 'g'
                                            ),
                                            '[ùúûü]', 'u', 'g'
                                        ),
                                        '[ç]', 'c', 'g'
                                    ),
                                    '[ñ]', 'n', 'g'
                                ),
                                '[ý]', 'y', 'g'
                            ),
                            '[đ]', 'd', 'g'
                        ),
                        '[^a-z0-9\s-]', '', 'g'  -- Remove ALL non-alphanumeric except spaces and hyphens
                    ),
                    '\s+', '-', 'g'  -- Replace spaces with hyphens
                ),
                '-+', '-', 'g'  -- Remove multiple consecutive hyphens
            ),
            '-'  -- Remove leading/trailing hyphens
        ),
        1, 100  -- Limit to 100 characters
    );
END;
$$ LANGUAGE plpgsql;

-- Update existing slugs that have special characters
UPDATE processed_articles 
SET slug = generate_slug(title) 
WHERE slug IS NOT NULL 
AND slug ~ '[^a-z0-9-]';  -- Only update slugs that contain special characters

-- Add comment to explain the improved function
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generates SEO-friendly slugs with proper Portuguese character handling, removing all special characters except alphanumeric and hyphens';