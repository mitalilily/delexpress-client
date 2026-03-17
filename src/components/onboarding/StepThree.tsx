import { alpha } from '@mui/material/styles'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { FiClock, FiLink, FiTool } from 'react-icons/fi'
import CustomInput from '../UI/inputs/CustomInput'
import type { UserInfoData } from '../../types/user.types'
import type { FormErrors } from '../../pages/onboarding/UserOnboarding'

interface IStepThree {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    subKey?: keyof UserInfoData,
  ) => void
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const DE_PLUM = '#8A1F43'
const DE_MINT = '#56C0A5'
const DE_MUTED = '#6A616A'

export default function StepThree({ formData, errors, onChange, setErrors }: IStepThree) {
  return (
    <Stack spacing={{ xs: 2.2, md: 2.8 }}>
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: DE_PLUM,
            mb: 0.8,
            fontSize: { xs: '1.2rem', sm: '1.45rem', md: '1.65rem' },
          }}
        >
          Integrations & Storefront
        </Typography>
        <Typography variant="body2" sx={{ color: DE_MUTED, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>
          Add your website now. Direct platform integrations can be enabled later from settings.
        </Typography>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        sx={{
          p: { xs: 2, md: 2.6 },
          borderRadius: 1.4,
          border: `1px solid ${alpha(DE_MINT, 0.26)}`,
          background: `linear-gradient(180deg, ${alpha(DE_MINT, 0.12)} 0%, ${alpha(
            DE_MINT,
            0.04,
          )} 100%)`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={1.1}>
          <FiTool size={16} color="#2F8E77" />
          <Typography sx={{ fontWeight: 700, color: '#2F8E77', fontSize: '0.95rem' }}>
            Shopify and channel integrations are currently unavailable
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: DE_MUTED, lineHeight: 1.6 }}>
          You can finish onboarding now. Once integrations are enabled, connect Shopify,
          WooCommerce, Amazon, or other channels from the Integrations page.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={1.4}>
          <Chip
            icon={<FiClock size={13} />}
            label="Available soon"
            size="small"
            sx={{ backgroundColor: '#fff', border: `1px solid ${alpha('#2F8E77', 0.2)}`, color: '#2F8E77' }}
          />
          <Chip
            icon={<FiLink size={13} />}
            label="Connect later from Settings"
            size="small"
            sx={{ backgroundColor: '#fff', border: `1px solid ${alpha('#2F8E77', 0.2)}`, color: '#2F8E77' }}
          />
        </Stack>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.32, ease: 'easeOut' }}
        sx={{
          p: { xs: 2, md: 2.6 },
          borderRadius: 1.4,
          border: `1px solid ${alpha(DE_PLUM, 0.14)}`,
          backgroundColor: alpha(DE_PLUM, 0.02),
        }}
      >
        <CustomInput
          onChange={(e) => onChange(e, 'basicInfo')}
          onBlur={(e) => {
            const value = e.target.value?.trim()
            const isValidURL =
              !value ||
              /^(https?:\/\/)?([\w\d-]+\.)+[\w]{2,}(\/[\w\d#?&=.-]*)*\/?$/.test(value)

            setErrors((prev) => ({
              ...prev,
              basicInfo: {
                ...prev.basicInfo,
                personalWebsite: isValidURL
                  ? ''
                  : 'Invalid URL. Example: https://www.yourstore.com',
              },
            }))
          }}
          name="personalWebsite"
          value={formData?.basicInfo?.personalWebsite}
          label="Business Website (Optional)"
          placeholder="https://www.yourstore.com"
          error={!!errors.basicInfo?.personalWebsite}
          helperText={errors.basicInfo?.personalWebsite}
          fullWidth
          prefix={<FiLink color={DE_PLUM} />}
        />
      </Box>
    </Stack>
  )
}
