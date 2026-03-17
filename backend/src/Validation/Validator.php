<?php

declare(strict_types=1);

namespace Fastway\Validation;

class Validator
{
    public static function validate(array $fields): array
    {
        $errors = [];

        foreach ($fields as $name => [$value, $ruleString]) {
            $rules = explode('|', $ruleString);

            foreach ($rules as $rule) {
                $error = self::applyRule($name, $value, $rule);
                if ($error !== null) {
                    $errors[] = $error;
                    break;
                }
            }
        }

        return $errors;
    }

    private static function applyRule(string $name, string $value, string $rule): ?string
    {
        if (str_contains($rule, ':')) {
            [$ruleName, $param] = explode(':', $rule, 2);
        } else {
            $ruleName = $rule;
            $param    = null;
        }

        $label = ucfirst(str_replace('_', ' ', $name));

        return match ($ruleName) {
            'required'       => $value === '' ? "{$label} is required." : null,
            'alphanumeric'   => !preg_match('/^[a-zA-Z0-9]+$/', $value)
                                    ? "{$label} must contain only letters and numbers." : null,
            'alpha_space'    => !preg_match('/^[a-zA-Z\s\-]+$/', $value)
                                    ? "{$label} must contain only letters and spaces." : null,
            'numeric'        => !ctype_digit($value) ? "{$label} must be a number." : null,
            'min'            => strlen($value) < (int) $param
                                    ? "{$label} must be at least {$param} characters." : null,
            'max'            => strlen($value) > (int) $param
                                    ? "{$label} must be no more than {$param} characters." : null,
            'length'         => strlen($value) !== (int) $param
                                    ? "{$label} must be exactly {$param} characters." : null,
            'positive_float' => (!is_numeric($value) || (float) $value <= 0)
                                    ? "{$label} must be a positive number." : null,
            'max_value'      => (is_numeric($value) && (float) $value > (float) $param)
                                    ? "{$label} must be no more than {$param}." : null,
            default          => null,
        };
    }
}
