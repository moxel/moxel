// Emailing service.
package main

import (
	// "fmt"
	"github.com/mattbaird/gochimp"
)

// Send template email to a list of recipients.
// Args:
// - template: HTML template of the email.
// - data: a list of maps, each contain variables for the template. Must have "recipient".
func SendTemplateEmail(subject string, template string, data []map[string]string) error {
	mandrillApi, err := gochimp.NewMandrill(MandrillAPIKey)
	if err != nil {
		return err
	}

	templateName := "welcome email"
	_, err = mandrillApi.TemplateAdd(templateName, template, true)
	if err != nil {
		return err
	}
	defer mandrillApi.TemplateDelete(templateName)

	recipients := []gochimp.Recipient{}
	for _, item := range data {
		recipients = append(recipients,
			gochimp.Recipient{Email: item["recipient"]},
		)
	}

	for _, vars := range data {
		content := []gochimp.Var{}
		for k, v := range vars {
			contentVar := *gochimp.NewVar(k, v)
			content = append(content, contentVar)
		}

		renderedTemplate, err := mandrillApi.TemplateRender(templateName, nil, content)
		if err != nil {
			return err
		}

		message := gochimp.Message{
			Html:      renderedTemplate,
			Subject:   subject,
			FromEmail: "newsletter@moxel.ai",
			FromName:  "Moxel",
			To:        recipients,
		}

		_, err = mandrillApi.MessageSend(message, false)
		if err != nil {
			return err
		}
	}

	return nil
}
