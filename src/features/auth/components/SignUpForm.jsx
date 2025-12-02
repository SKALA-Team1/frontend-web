import React from 'react'
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material'

export default function SignUpForm(props) {
  const {
    name,
    signupEmail,
    signupPassword,
    confirmPassword,
    emailVerificationCode,
    agreeTerms,
    agreePrivacy,
    openTermsModal,
    openPrivacyModal,
    selectedRole,
    errors,
    sendingCode,
    signupLoading,
    successMessage,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleEmailVerificationCodeChange,
    handleSendVerificationCode,
    handleVerifyCode,
    verifyingCode,
    emailVerified,
    setAgreeTerms,
    setAgreePrivacy,
    setOpenTermsModal,
    setOpenPrivacyModal,
    handleSignup,
    handleRoleChange,
    onNavigateLogin
  } = props

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700} align="center">회원가입</Typography>

        <Stack spacing={1}>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>이름</Typography>
            <TextField
              placeholder="이름을 입력해주세요."
              value={name}
              onChange={handleNameChange}
              fullWidth
              error={!!errors.name}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#F5F6FF'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(124,108,255,0.8)'
                  }
                }
              }}
            />
            {errors.name && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.name}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>이메일</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="이메일을 입력해주세요."
                value={signupEmail}
                onChange={handleEmailChange}
                fullWidth
                error={!!errors.email}
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#F5F6FF'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)'
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(124,108,255,0.8)'
                    }
                  }
                }}
              />
              <Button 
                variant="outlined" 
                sx={{ minWidth: 127 }} 
                onClick={handleSendVerificationCode}
                disabled={sendingCode || !signupEmail || !!errors.email}
              >
                {sendingCode ? <CircularProgress size={20} /> : '인증 코드 발송'}
              </Button>
            </Stack>
            {errors.email && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.email}
              </Typography>
            )}
          </Box>

          
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>이메일 인증 코드</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                type="text"
                placeholder="이메일 인증 코드를 입력하세요 (6자리)"
                value={emailVerificationCode}
                onChange={handleEmailVerificationCodeChange}
                error={!!errors.emailVerificationCode}
                inputProps={{ maxLength: 6 }}
                disabled={emailVerified}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': {
                    color: '#F5F6FF'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)'
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: emailVerified ? 'rgba(76,175,80,0.5)' : 'rgba(255,255,255,0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: emailVerified ? 'rgba(76,175,80,0.7)' : 'rgba(255,255,255,0.3)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: emailVerified ? 'rgba(76,175,80,0.8)' : 'rgba(124,108,255,0.8)'
                    }
                  }
                }}
              />
              <Button 
                variant="outlined" 
                sx={{ minWidth: 100 }} 
                onClick={handleVerifyCode}
                disabled={verifyingCode || !emailVerificationCode || emailVerificationCode.length !== 6 || emailVerified}
              >
                {verifyingCode ? (
                  <CircularProgress size={20} />
                ) : emailVerified ? (
                  '인증완료'
                ) : (
                  '인증확인'
                )}
              </Button>
            </Stack>
            {errors.emailVerificationCode && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.emailVerificationCode}
              </Typography>
            )}
            {emailVerified && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                이메일 인증이 완료되었습니다.
              </Typography>
            )}
          </Box>
          
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>비밀번호</Typography>
            <TextField
              type="password"
              placeholder="비밀번호를 입력해주세요."
              value={signupPassword}
              onChange={handlePasswordChange}
              fullWidth
              error={!!errors.password}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#F5F6FF',
                  letterSpacing: 'normal',
                  fontFamily: 'inherit'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(124,108,255,0.8)'
                  }
                }
              }}
            />
            {errors.password && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.password}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>비밀번호 확인</Typography>
            <TextField
              type="password"
              placeholder="비밀번호를 다시 한 번 입력해주세요."
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              fullWidth
              error={!!errors.confirmPassword}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#F5F6FF',
                  letterSpacing: 'normal',
                  fontFamily: 'inherit'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(124,108,255,0.8)'
                  }
                }
              }}
            />
            {errors.confirmPassword && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.confirmPassword}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>직무</Typography>
            <TextField
              placeholder="직무를 입력해주세요."
              value={selectedRole}
              onChange={handleRoleChange}
              fullWidth
              error={!!errors.role}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#F5F6FF'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(124,108,255,0.8)'
                  }
                }
              }}
            />
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.role}
              </Typography>
            )}
          </Box>

          <Stack spacing={1} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={() => setOpenTermsModal(true)}
                />
              }
              label="서비스 이용 약관 동의"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreePrivacy}
                  onChange={() => setOpenPrivacyModal(true)}
                />
              }
              label="개인정보 수집 및 이용동의 동의"
            />
          </Stack>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {successMessage}
            </Alert>
          )}
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleSignup}
            disabled={signupLoading}
          >
            {signupLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                회원가입 중...
              </>
            ) : (
              '회원가입하기'
            )}
          </Button>
          <Button variant="contained" fullWidth onClick={onNavigateLogin}>
            로그인으로 돌아가기
          </Button>
        </Stack>

        <Dialog open={openTermsModal} onClose={() => setOpenTermsModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>사내 서비스 이용약관</DialogTitle>
          <DialogContent>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', py: 1 }}>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                본 약관은 SK AX 및 관계 부서에서 제공하는 AI 기반 협업 지원 및 영어 롤플레잉 서비스(이하 “서비스”) 이용에 필요한 최소한의 조건을 규정합니다.
                사용자는 본 약관에 동의함으로써 서비스를 사용할 수 있습니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>1. 서비스 목적</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                본 서비스는 사내 협업 품질 향상, 영어 커뮤니케이션 훈련, 업무 진행 상황 기반 시나리오 제공 등을 지원하기 위해 운영됩니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>2. 사용자 의무</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                • 본 서비스는 업무 목적으로만 사용할 수 있습니다.<br />
                • 회사의 보안·정보보호 정책을 준수해야 합니다.<br />
                • 타인의 계정 또는 정보를 무단 사용해서는 안 됩니다.<br />
                • 민감 정보나 외부 공유가 제한된 내용 입력 시 보안 등급을 준수해야 합니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>3. 데이터 처리</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                • 입력된 텍스트·음성·업무 정보는 서비스 제공 목적에 한해 처리되며, AI 모델 학습에는 직접 사용되지 않습니다.<br />
                • 데이터는 회사 규정과 보안정책에 따라 저장·보관·삭제됩니다.<br />
                • 음성 녹음 또는 회의 로그 수집 기능을 사용할 경우, 관련 사내 지침을 준수해야 합니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>4. 금지행위</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                아래 행위는 금지됩니다.<br />
                • 비업무적 생성 활동(개인적 훈련, 외부 서비스 제공 등)<br />
                • 회사 기밀·코드·문서를 외부 서비스로 전송<br />
                • 해킹, 비정상적 접근 시도<br />
                • 비윤리적·불법적 콘텐츠 생성
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>5. 서비스 중단 및 변경</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                • 시스템 점검 또는 보안 이슈 발생 시 서비스가 일시 중단될 수 있습니다.<br />
                • 기능은 업무 효율 개선을 위해 변경 또는 추가될 수 있습니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>6. 책임 제한</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                회사는 서비스 안정성 확보를 위해 노력하나, 시스템 장애나 네트워크 문제로 발생한 손해에 대해 법령이 허용하는 범위 내에서 책임을 제한할 수 있습니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>7. 기타</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                본 약관에 명시되지 않은 사항은 회사 내부 규정 및 정보보안지침을 따릅니다.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked)
                    if (e.target.checked) setOpenTermsModal(false)
                  }}
                />
              }
              label="위 약관에 동의합니다"
            />
            <Button onClick={() => setOpenTermsModal(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openPrivacyModal} onClose={() => setOpenPrivacyModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>개인정보 수집 및 이용 동의서</DialogTitle>
          <DialogContent>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', py: 1 }}>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                본 서비스는 SK AX 및 관계 조직에서 제공하는 AI 기반 협업 지원 및 영어 롤플레잉 서비스(이하 “서비스”) 운영을 위해 아래와 같이 개인정보를 수집·이용합니다.
                서비스 이용자는 아래 내용을 충분히 이해하고 동의해야 합니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>1. 수집하는 개인정보 항목</Typography>
              <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8, fontWeight: 700 }}>
                필수 항목
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
                • 사내 계정 정보(이메일, 사번 또는 S-Login ID)<br />
                • 이름 또는 닉네임<br />
                • 서비스 이용 기록(접속 일시, 시나리오 기록 등)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8, fontWeight: 700 }}>
                선택 항목
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
                • 음성 데이터(STT/TTS 기능 사용 시)<br />
                • 회의 로그 및 업무 입력 정보(GitHub/Slack 연동 시)
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>2. 개인정보의 이용 목적</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
                • 서비스 로그인 및 사용자 인증<br />
                • 롤플레잉 시나리오 생성 및 업무 맥락 분석<br />
                • 영어 회화 훈련/AI 응답 생성<br />
                • 서비스 품질 개선 및 기능 업데이트<br />
                • 이상 행위 탐지 등 보안 관리<br />
                • 시스템 이용 통계 분석
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, fontStyle: 'italic', color: 'text.primary' }}>
                ※ 입력된 정보는 AI 모델 학습 데이터로 직접 사용되지 않습니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>3. 개인정보 보유 및 이용 기간</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
                • 재직 중 서비스 이용 기간 동안 보관<br />
                • 퇴사, 권한 회수, 서비스 종료 시 내부 정책에 따라 삭제<br />
                • 일부 로그는 법규 및 보안정책에 따라 일정 기간 보관될 수 있음
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>4. 제3자 제공 및 외부 전송</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8, pl: 2 }}>
                • 서비스 기능 수행을 위해 필요한 경우에 한해 음성·텍스트 데이터가 STT/TTS API 등 외부 처리 시스템으로 전달될 수 있습니다.<br />
                • 모든 전송은 정보보안 정책에 따라 암호화하여 처리되며, 외부로 판매·공유하지 않습니다.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>5. 동의 거부 권리 및 불이익</Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                사용자는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 단, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreePrivacy}
                  onChange={(e) => {
                    setAgreePrivacy(e.target.checked)
                    if (e.target.checked) setOpenPrivacyModal(false)
                  }}
                />
              }
              label="위 내용에 동의합니다"
            />
            <Button onClick={() => setOpenPrivacyModal(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

