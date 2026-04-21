{{- define "recovery-health-aid-backend.name" -}}
recovery-health-aid-backend
{{- end -}}

{{- define "recovery-health-aid-backend.fullname" -}}
{{ .Release.Name }}-backend
{{- end -}}

{{- define "recovery-health-aid-backend.chart" -}}
{{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}