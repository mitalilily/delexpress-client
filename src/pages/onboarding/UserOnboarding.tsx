import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import StepOneForm from '../../components/onboarding/StepOneForm'
import StepThree from '../../components/onboarding/StepThree'
import StepTwoForm from '../../components/onboarding/StepTwoForm'
import SwitchAccountButton from '../../components/onboarding/SwitchAccountButton'
import CustomIconLoadingButton from '../../components/UI/button/CustomLoadingButton'
import FullScreenLoader from '../../components/UI/loader/FullScreenLoader'
import { useAuth } from '../../context/auth/AuthContext'
import { useCompleteUserOnboarding } from '../../hooks/useCompleteUserOnboarding'
import type { UserInfoData } from '../../types/user.types'
import { hasValidationErrors, validateOnboardingFields } from '../../utils/functions'
import { initialFormData } from '../../utils/utility'

const DE_PLUM = '#8A1F43'
const DE_MINT = '#56C0A5'
const DE_TEXT = '#161219'
const DE_MUTED = '#6A616A'
const DE_IVORY = '#F7F2ED'

export type FormErrors = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof UserInfoData]: any
}

const steps = [
  { key: 1, title: 'Profile Details', helper: 'Contact and company details' },
  { key: 2, title: 'Business Setup', helper: 'Category and monthly shipments' },
  { key: 3, title: 'Integrations', helper: 'Storefront and future channel setup' },
]

export default function UserOnboarding() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { user: userData, loading: fetchingUserData } = useAuth()
  const { mutateAsync: completeOnboarding, isPending } = useCompleteUserOnboarding()

  const [step, setStep] = useState<number>(1)
  const [formData, setFormData] = useState<UserInfoData>({ ...initialFormData })
  const [formErrors, setFormErrors] = useState<FormErrors>({ ...initialFormData })

  const progressPercent = useMemo(() => Math.round((step / steps.length) * 100), [step])

  useEffect(() => {
    if (!userData) return

    if (userData.onboardingComplete) {
      navigate('/home')
      return
    }

    const resumeStep = (userData.onboardingStep ?? 0) + 1
    const clamped = Math.min(Math.max(resumeStep, 1), steps.length)
    setStep(clamped)
  }, [userData, navigate])

  useEffect(() => {
    if (!userData || !Object.keys(userData).length) return

    setFormData({
      basicInfo: {
        firstName: userData?.companyInfo?.contactPerson?.split(' ')?.[0] ?? '',
        lastName: userData?.companyInfo?.contactPerson?.split(' ')?.slice(1).join(' ') ?? '',
        email: userData?.companyInfo?.contactEmail ?? '',
        phone: userData?.companyInfo?.contactNumber ?? '',
        companyName: userData?.companyInfo?.businessName ?? '',
        pincode: userData?.companyInfo?.pincode ?? '',
        state: userData?.companyInfo?.state ?? '',
        city: userData?.companyInfo?.city ?? '',
        personalWebsite: userData?.companyInfo?.website ?? '',
      },
      businessLegal: {
        brandName: userData?.companyInfo?.brandName ?? '',
        businessCategory: userData?.businessType ?? [],
        monthlyShipments: userData?.monthlyOrderCount ?? '0-100',
      },
      platformIntegration: { ...(userData?.salesChannels ?? {}) },
    })
  }, [userData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    subKey?: keyof UserInfoData,
  ) => {
    const { name, value } = e.target

    const updatedForm = subKey
      ? {
          ...formData,
          [subKey]: {
            ...formData[subKey],
            [name]: value,
          },
        }
      : {
          ...formData,
          [name]: value,
        }

    setFormData(updatedForm)

    const newErrors = validateOnboardingFields(updatedForm, step)
    setFormErrors((prev) => {
      if (subKey) {
        return {
          ...prev,
          [subKey]: {
            ...prev[subKey],
            [name]: newErrors[subKey]?.[name] || '',
          },
        }
      }
      return {
        ...prev,
        [name]: newErrors[name] || '',
      }
    })
  }

  const handleNext = async () => {
    const errors = validateOnboardingFields(formData, step)
    setFormErrors(errors)

    if (hasValidationErrors(errors)) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await completeOnboarding({ step, data: formData })

    if (response?.user) {
      if (step < steps.length) {
        setStep((prev) => prev + 1)
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        navigate('/home')
      }
    }
  }

  if (fetchingUserData) return <FullScreenLoader />

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: DE_IVORY,
        background: `radial-gradient(circle at 0% 0%, ${alpha(DE_PLUM, 0.08)} 0%, transparent 42%),
                     radial-gradient(circle at 100% 100%, ${alpha(DE_MINT, 0.1)} 0%, transparent 40%),
                     linear-gradient(180deg, #FFF9F4 0%, ${DE_IVORY} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 2, md: 4 },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ width: '100%', maxWidth: 840, mb: 3 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 900, color: DE_PLUM, letterSpacing: -0.5, fontSize: '1.4rem' }}
        >
          DelExpress
        </Typography>
        <SwitchAccountButton />
      </Stack>

      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 840,
          borderRadius: 3,
          border: `1px solid ${alpha(DE_PLUM, 0.12)}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          boxShadow: `0 24px 60px ${alpha(DE_TEXT, 0.09)}`,
        }}
      >
        {/* Sidebar Progress */}
        <Box
          sx={{
            width: { xs: '100%', md: 280 },
            bgcolor: alpha(DE_PLUM, 0.03),
            borderRight: { md: `1px solid ${alpha(DE_PLUM, 0.08)}` },
            borderBottom: { xs: `1px solid ${alpha(DE_PLUM, 0.08)}`, md: 'none' },
            p: 3,
          }}
        >
          <Stack spacing={3.5}>
            {steps.map((s) => {
              const active = step === s.key
              const completed = step > s.key

              return (
                <Stack
                  key={s.key}
                  component={motion.div}
                  direction="row"
                  spacing={1.8}
                  alignItems="center"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: s.key * 0.08, duration: 0.28 }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed ? DE_MINT : active ? DE_PLUM : 'transparent',
                      border: completed
                        ? 'none'
                        : `1.5px solid ${active ? DE_PLUM : alpha(DE_PLUM, 0.2)}`,
                      color: completed || active ? '#fff' : alpha(DE_PLUM, 0.4),
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {completed ? <FiCheckCircle size={18} /> : s.key}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: active ? DE_PLUM : completed ? DE_MINT : alpha(DE_PLUM, 0.45),
                      }}
                    >
                      {s.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: alpha(DE_MUTED, 0.8),
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {s.helper}
                    </Typography>
                  </Box>
                </Stack>
              )
            })}
          </Stack>

          <Box sx={{ mt: 6 }}>
            <Typography variant="caption" sx={{ color: alpha(DE_MUTED, 0.9), fontWeight: 700 }}>
              COMPLETION
            </Typography>
            <Box
              sx={{
                height: 6,
                bgcolor: alpha(DE_PLUM, 0.08),
                borderRadius: 3,
                mt: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${DE_PLUM} 0%, ${DE_MINT} 100%)`,
                  transition: 'width 0.5s ease',
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ mt: 0.8, display: 'block', fontWeight: 800, color: DE_PLUM }}
            >
              {progressPercent}% Finished
            </Typography>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 }, bgcolor: '#fffdf9' }}>
          <AnimatePresence mode="wait">
            <Box
              key={step}
              component={motion.div}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {step === 1 && (
                <StepOneForm
                  formData={formData}
                  errors={formErrors}
                  onChange={handleChange}
                  setFormData={setFormData}
                  setErrors={setFormErrors}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <StepTwoForm formData={formData} errors={formErrors} onChange={handleChange} />
              )}
              {step === 3 && (
                <StepThree
                  formData={formData}
                  errors={formErrors}
                  onChange={handleChange}
                  setErrors={setFormErrors}
                />
              )}
            </Box>
          </AnimatePresence>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 5, pt: 3, borderTop: `1px solid ${alpha(DE_PLUM, 0.08)}` }}
          >
            {step > 1 && (
              <Button
                onClick={() => setStep((p) => p - 1)}
                startIcon={<MdArrowBack />}
                sx={{
                  color: DE_PLUM,
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 3,
                  borderRadius: 1.2,
                  '&:hover': { bgcolor: alpha(DE_PLUM, 0.06) },
                }}
              >
                Previous
              </Button>
            )}

            <CustomIconLoadingButton
              fullWidth
              loading={isPending}
              onClick={handleNext}
              icon={step < steps.length ? <MdArrowForward /> : <FiCheckCircle />}
              text={step < steps.length ? 'Continue' : 'Complete Setup'}
              loadingText="Saving..."
              textColor="#fff"
              styles={{
                flex: 1,
                borderRadius: 1.2,
                bgcolor: DE_PLUM,
                py: 1.2,
                boxShadow: `0 12px 24px ${alpha(DE_PLUM, 0.24)}`,
                '&:hover': { bgcolor: '#6F1735' },
              }}
            />
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
