import { Box, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { MdBusiness, MdTrendingUp } from 'react-icons/md'
import type { UserInfoData } from '../../types/user.types'
import type { FormErrors } from '../../pages/onboarding/UserOnboarding'
import { createSyntheticEvent } from '../../utils/functions'
import CustomInput from '../UI/inputs/CustomInput'
import CustomSelect from '../UI/inputs/CustomSelect'

interface StepTwoFormProps {
  formData: UserInfoData
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    subKey: keyof UserInfoData,
  ) => void
  errors: FormErrors
}

const DE_PLUM = '#8A1F43'
const DE_MINT = '#56C0A5'
const DE_MUTED = '#6A616A'

const BUSINESS_OPTIONS = [
  {
    key: 'b2b',
    title: 'B2B',
    subtitle: 'I sell to other businesses',
  },
  {
    key: 'b2c',
    title: 'Marketplace B2C',
    subtitle: 'I sell on Amazon, Flipkart, etc.',
  },
  {
    key: 'd2c',
    title: 'D2C',
    subtitle: 'I sell via website, social, or store',
  },
]

export default function StepTwoForm({ formData, onChange, errors }: StepTwoFormProps) {
  const [sameAsCompany, setSameAsCompany] = useState(false)

  const selectedCategories = useMemo(
    () =>
      Array.isArray(formData?.businessLegal?.businessCategory)
        ? formData.businessLegal.businessCategory
        : [],
    [formData?.businessLegal?.businessCategory],
  )

  useEffect(() => {
    if (!sameAsCompany) return

    const companyName = formData.basicInfo?.companyName || ''
    onChange(createSyntheticEvent('brandName', companyName), 'businessLegal')
  }, [sameAsCompany, formData.basicInfo?.companyName, onChange])

  const toggleCategory = (value: string) => {
    const next = selectedCategories.includes(value)
      ? selectedCategories.filter((item) => item !== value)
      : [...selectedCategories, value]

    onChange(createSyntheticEvent('businessCategory', next), 'businessLegal')
  }

  return (
    <Stack spacing={{ xs: 2.2, md: 2.8 }}>
      <Typography variant="body2" sx={{ color: DE_MUTED, lineHeight: 1.55 }}>
        Choose your business model and shipping volume so we can configure your account defaults.
      </Typography>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        sx={{
          p: { xs: 1.6, md: 2 },
          borderRadius: 1.4,
          border: `1px solid ${alpha(DE_PLUM, 0.12)}`,
          backgroundColor: '#fff',
          boxShadow: `0 12px 22px ${alpha(DE_PLUM, 0.06)}`,
        }}
      >
        <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: DE_PLUM, mb: 1.2 }}>
          Select one or more business types
        </Typography>

        <Grid container spacing={1.3}>
          {BUSINESS_OPTIONS.map((option) => {
            const active = selectedCategories.includes(option.key)

            return (
              <Grid key={option.key} size={{ xs: 12, md: 4 }}>
                <Box
                  component={motion.div}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleCategory(option.key)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') toggleCategory(option.key)
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.2,
                    border: `1px solid ${active ? alpha(DE_PLUM, 0.4) : alpha(DE_PLUM, 0.12)}`,
                    backgroundColor: active ? alpha(DE_PLUM, 0.05) : '#fff',
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 20px ${alpha(DE_PLUM, 0.08)}`,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: active ? DE_PLUM : '#3B313D',
                    }}
                  >
                    {option.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: DE_MUTED, mt: 0.2 }}>
                    {option.subtitle}
                  </Typography>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.32, ease: 'easeOut' }}
        sx={{
          p: { xs: 1.6, md: 2 },
          borderRadius: 1.4,
          border: `1px solid ${alpha(DE_PLUM, 0.12)}`,
          backgroundColor: '#fff',
          boxShadow: `0 12px 22px ${alpha(DE_PLUM, 0.06)}`,
        }}
      >
        <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: DE_PLUM, mb: 1.6 }}>
          Monthly Volume & Brand Identity
        </Typography>

        <Grid container spacing={2.2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomSelect
              label="Expected Shipments / Month"
              name="monthlyShipments"
              value={formData?.businessLegal?.monthlyShipments}
              onChange={(e) => onChange(e, 'businessLegal')}
              required
              error={!!errors.businessLegal.monthlyShipments}
              helperText={errors.businessLegal.monthlyShipments}
              prefix={<MdTrendingUp color={DE_PLUM} />}
            >
              <option value="">Select volume range</option>
              <option value="0-100">0 - 100</option>
              <option value="101-500">101 - 500</option>
              <option value="501-2000">501 - 2,000</option>
              <option value="2000+">2,000+</option>
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <CustomInput
                label="Brand Name"
                name="brandName"
                value={formData?.businessLegal?.brandName}
                onChange={(e) => onChange(e, 'businessLegal')}
                required
                error={!!errors.businessLegal.brandName}
                helperText={errors.businessLegal.brandName}
                prefix={<MdBusiness color={DE_PLUM} />}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={sameAsCompany}
                    onChange={(e) => setSameAsCompany(e.target.checked)}
                    sx={{ color: alpha(DE_PLUM, 0.4), '&.Mui-checked': { color: DE_PLUM } }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: DE_MUTED, fontWeight: 600 }}>
                    Same as company name
                  </Typography>
                }
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
        sx={{
          p: 1.5,
          borderRadius: 1.4,
          bgcolor: alpha(DE_MINT, 0.08),
          border: `1px solid ${alpha(DE_MINT, 0.22)}`,
        }}
      >
        <Typography variant="caption" sx={{ color: '#2F8E77', fontWeight: 700, display: 'block' }}>
          Configuring your account based on your business type helps us provide the most relevant
          carrier recommendations.
        </Typography>
      </Box>
    </Stack>
  )
}
